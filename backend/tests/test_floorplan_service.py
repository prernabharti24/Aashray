import pytest
import cv2
import numpy as np
import io
import os
import sys

# Support running from root or inside Aashray
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.floorplan_service import (
        analyze_floorplan_image,
        parse_dimension_value,
        parse_scale_string,
        parse_dual_dimensions,
        load_file_to_image,
        preprocess_floorplan,
        detect_walls_and_envelope
    )
except ImportError:
    from floorplan_service import (
        analyze_floorplan_image,
        parse_dimension_value,
        parse_scale_string,
        parse_dual_dimensions,
        load_file_to_image,
        preprocess_floorplan,
        detect_walls_and_envelope
    )


def create_synthetic_floorplan_image(size=(600, 800), wall_box=(150, 100, 500, 380), noisy=False):
    """
    Creates a realistic architectural floor plan image with walls using OpenCV.
    """
    h, w = size
    # White background paper
    img = np.ones((h, w, 3), dtype=np.uint8) * 255

    wall_x, wall_y, wall_w, wall_h = wall_box
    wall_color = (30, 30, 30)
    # External load-bearing walls (thick lines)
    cv2.rectangle(img, (wall_x, wall_y), (wall_x + wall_w, wall_y + wall_h), wall_color, 8)

    # Interior partition wall
    cv2.line(img, (wall_x + 280, wall_y), (wall_x + 280, wall_y + wall_h), wall_color, 4)
    # Door opening in partition
    cv2.line(img, (wall_x + 280, wall_y + 120), (wall_x + 280, wall_y + 180), (255, 255, 255), 6)

    # Dimension witness lines
    cv2.line(img, (wall_x, wall_y - 25), (wall_x + wall_w, wall_y - 25), (70, 70, 70), 1)
    cv2.line(img, (wall_x, wall_y - 35), (wall_x, wall_y - 15), (70, 70, 70), 1)
    cv2.line(img, (wall_x + wall_w, wall_y - 35), (wall_x + wall_w, wall_y - 15), (70, 70, 70), 1)

    if noisy:
        # Add salt-and-pepper / scan noise
        noise = np.random.randint(0, 40, (h, w, 3), dtype=np.uint8)
        img = cv2.subtract(img, noise)

    _, buffer = cv2.imencode(".png", img)
    return buffer.tobytes()


def test_parse_dimension_value():
    assert parse_dimension_value("6.50 m") == (6.5, "m")
    assert parse_dimension_value("6000 mm") == (6.0, "mm")
    assert parse_dimension_value("450 cm") == (4.5, "cm")
    assert parse_dimension_value("4500") == (4.5, "mm (inferred)")
    assert parse_dimension_value("5.20") == (5.2, "m (inferred)")


def test_parse_scale_string():
    assert parse_scale_string("Scale 1:100") == 100.0
    assert parse_scale_string("1:50") == 50.0
    assert parse_scale_string("1/200") == 200.0
    assert parse_scale_string("") is None


def test_parse_dual_dimensions():
    res = parse_dual_dimensions("6.0 x 4.0 m")
    assert res is not None
    d1, d2, unit = res
    assert d1 == 6.0 and d2 == 4.0 and unit == "m"

    res_mm = parse_dual_dimensions("6000 x 4000 mm")
    assert res_mm is not None
    d1_mm, d2_mm, unit_mm = res_mm
    assert d1_mm == 6.0 and d2_mm == 4.0 and unit_mm == "mm"


def test_opencv_wall_boundary_detection():
    # Verify pure OpenCV pipeline extracts the outer wall envelope accurately
    img_bytes = create_synthetic_floorplan_image(wall_box=(150, 100, 500, 380))
    img_bgr = load_file_to_image(img_bytes, "floorplan.png")
    proc_img, binary, scale = preprocess_floorplan(img_bgr)
    outer_box, wall_lines = detect_walls_and_envelope(binary, proc_img)

    assert outer_box is not None
    x, y, w, h = outer_box
    # Bounding box should closely encompass the 500x380 wall rectangle
    assert abs(w - 500) < 25
    assert abs(h - 380) < 25
    assert len(wall_lines) >= 4  # detected horizontal and vertical wall segments


def test_uncalibrated_never_guesses():
    # Strict requirement: without calibration/scale, must not invent dimensions
    img_bytes = create_synthetic_floorplan_image()
    result = analyze_floorplan_image(img_bytes, "uncalibrated_plan.png")
    assert result["success"] is True
    assert result["has_dimensions"] is False
    assert result["length_m"] is None
    assert result["width_m"] is None
    assert result["pixel_length"] > 0
    assert result["pixel_width"] > 0
    assert "A 2D floor-plan image alone cannot reveal real-world meters" in result["message"]
    assert result["preview_image"].startswith("data:image/png;base64,")


def test_scale_calibration_with_reference_measurement():
    # Calibrate floor plan using reference measurement (e.g. 7.5 meters frontage)
    img_bytes = create_synthetic_floorplan_image(wall_box=(150, 100, 500, 380))
    result = analyze_floorplan_image(
        img_bytes,
        "floorplan.png",
        reference_length_m=7.5
    )
    assert result["success"] is True
    assert result["has_dimensions"] is True
    assert result["length_m"] == 7.5
    assert result["width_m"] is not None
    assert 5.0 <= result["width_m"] <= 6.5  # Proportionally ~ 7.5 * (380 / 500) = 5.7m
    assert "calibrated" in result["detected_unit"].lower()


def test_scale_calibration_with_drawing_scale():
    # Calibrate using drawing scale ratio 1:100
    img_bytes = create_synthetic_floorplan_image(wall_box=(100, 100, 400, 300))
    result = analyze_floorplan_image(
        img_bytes,
        "floorplan.png",
        scale_ratio="1:100"
    )
    assert result["success"] is True
    assert result["has_dimensions"] is True
    assert result["detected_scale"] == "1:100"
    assert result["length_m"] is not None
    assert result["width_m"] is not None
    assert result["length_m"] > 0
    assert result["width_m"] > 0


def test_different_orientations():
    # Test portrait orientation where height > width
    img_bytes = create_synthetic_floorplan_image(size=(900, 600), wall_box=(100, 150, 380, 600))
    result = analyze_floorplan_image(
        img_bytes,
        "portrait_plan.png",
        reference_length_m=9.0
    )
    assert result["success"] is True
    assert result["has_dimensions"] is True
    assert result["length_m"] == 9.0
    assert result["width_m"] is not None
    assert result["width_m"] < 9.0  # Width should be smaller than length


def test_noisy_low_quality_image():
    # Test noisy image with texture/scanning artifacts
    img_bytes = create_synthetic_floorplan_image(noisy=True)
    result = analyze_floorplan_image(
        img_bytes,
        "noisy_plan.png",
        reference_length_m=6.0
    )
    assert result["success"] is True
    assert result["has_dimensions"] is True
    assert result["length_m"] == 6.0
    assert result["width_m"] is not None
    assert result["width_m"] > 0


def test_invalid_file_handling():
    # Corrupt or non-image bytes should raise a clear ValueError
    with pytest.raises(ValueError, match="Could not decode image file"):
        load_file_to_image(b"not an image file data content", "corrupted.png")

    with pytest.raises(ValueError, match="Unsupported file format"):
        load_file_to_image(b"content", "file.txt")

    with pytest.raises(ValueError, match="Uploaded file is empty"):
        load_file_to_image(b"", "empty.png")


def test_pdf_upload_analysis():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 6))
    rect = plt.Rectangle((0.2, 0.2), 0.6, 0.5, fill=False, edgecolor='black', linewidth=4)
    ax.add_patch(rect)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    buf = io.BytesIO()
    fig.savefig(buf, format="pdf", dpi=150)
    plt.close(fig)
    pdf_bytes = buf.getvalue()

    result = analyze_floorplan_image(pdf_bytes, "floorplan.pdf", reference_length_m=8.0)
    assert result["success"] is True
    assert result["has_dimensions"] is True
    assert result["length_m"] == 8.0
    assert result["width_m"] is not None
    assert result["preview_image"].startswith("data:image/png;base64,")
