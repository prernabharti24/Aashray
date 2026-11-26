"""
AASHRAY Floor Plan Dimension Detection Service
Traditional Computer Vision & OpenCV Pipeline (No AI / ML models)

Strictly adheres to:
1. Image preprocessing: Grayscale, Gaussian / Median Blur, Adaptive & Otsu Thresholding.
2. Wall & boundary detection: Morphological kernels (horizontal/vertical), HoughLinesP line detection, OpenCV contour analysis.
3. Dimension calculation & scale calibration: External boundary pixel extraction with proportional meter conversion upon user reference or scale ratio.
4. No AI/ML: 100% deterministic OpenCV image processing without neural networks, PyTorch, TensorFlow, ONNX, or external AI services.
"""

import re
import cv2
import numpy as np
import base64
from typing import Optional, Tuple, List, Dict, Any
import pypdfium2 as pdfium


def load_file_to_image(file_bytes: bytes, filename: str) -> np.ndarray:
    """
    Loads PNG, JPG, JPEG, or PDF bytes into a BGR numpy image.
    Validates file format and raises ValueError for corrupt/unsupported files.
    """
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    lower_name = filename.lower()
    allowed_exts = ('.png', '.jpg', '.jpeg', '.pdf')
    if not any(lower_name.endswith(ext) for ext in allowed_exts):
        raise ValueError(f"Unsupported file format '{filename}'. Allowed: PNG, JPG, JPEG, PDF.")

    if lower_name.endswith('.pdf'):
        # Render first page of PDF using pypdfium2 at 150 DPI (scale 2.08)
        try:
            pdf = pdfium.PdfDocument(file_bytes)
            if len(pdf) == 0:
                raise ValueError("PDF document is empty (0 pages).")
            page = pdf[0]
            bitmap = page.render(scale=2.0)
            pil_image = bitmap.to_pil()
            img = np.array(pil_image)
            if len(img.shape) == 2:
                img_bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            elif img.shape[2] == 4:
                img_bgr = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
            else:
                img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            return img_bgr
        except Exception as e:
            raise ValueError(f"Failed to decode PDF floor plan: {str(e)}")
    else:
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image file. The file may be corrupted or not a valid image.")
        return img


def image_to_base64_data_url(image_bgr: np.ndarray, ext: str = ".png") -> str:
    """
    Encodes OpenCV BGR image to a base64 data URL string.
    """
    success, buffer = cv2.imencode(ext, image_bgr)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime = "image/png" if ext == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64_str}"


def parse_scale_string(text: str) -> Optional[float]:
    """
    Detects scale ratios like 1:100, 1:50, 1/100, Scale: 1:50.
    Returns the numeric ratio (e.g. 100.0 for 1:100).
    """
    if not text:
        return None
    match = re.search(r'(?:scale\s*[:/]?\s*)?1\s*[:/]\s*(\d{1,4})\b', text, re.IGNORECASE)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    return None


def parse_dimension_value(text: str) -> Optional[Tuple[float, str]]:
    """
    Extracts a dimension value in meters and its detected unit.
    Returns (meters, unit_str).
    """
    if not text:
        return None
    text = text.strip().replace(',', '.')

    # Meters: e.g. "6.5 m", "6.5m", "6.50 meters", "6.50mtr"
    m_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:m|meter|meters|mtr|mtrs)\b', text, re.IGNORECASE)
    if m_match:
        val = float(m_match.group(1))
        if 0.5 <= val <= 100.0:
            return (val, "m")

    # Millimeters: e.g. "6500 mm", "6500mm"
    mm_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:mm|millimeter|millimeters)\b', text, re.IGNORECASE)
    if mm_match:
        val = float(mm_match.group(1))
        if 500.0 <= val <= 100000.0:
            return (val / 1000.0, "mm")

    # Centimeters: e.g. "650 cm", "650cm"
    cm_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:cm|centimeter|centimeters)\b', text, re.IGNORECASE)
    if cm_match:
        val = float(cm_match.group(1))
        if 50.0 <= val <= 10000.0:
            return (val / 100.0, "cm")

    # Feet and inches: e.g. 15' 6" or 15ft
    ft_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:\'|ft|feet)\s*(?:-?\s*(\d+(?:\.\d+)?)\s*(?:\"|in|inch|inches)?)?', text, re.IGNORECASE)
    if ft_match:
        feet = float(ft_match.group(1))
        inches = float(ft_match.group(2)) if ft_match.group(2) else 0.0
        val_m = (feet * 0.3048) + (inches * 0.0254)
        if 0.5 <= val_m <= 100.0:
            return (val_m, "ft/in")

    # Raw numbers:
    num_match = re.search(r'^\s*(\d+(?:\.\d+)?)\s*$', text)
    if num_match:
        val = float(num_match.group(1))
        if 800.0 <= val <= 50000.0 and val.is_integer():
            return (val / 1000.0, "mm (inferred)")
        elif 1.5 <= val <= 35.0 and '.' in num_match.group(1):
            return (val, "m (inferred)")

    return None


def parse_dual_dimensions(text: str) -> Optional[Tuple[float, float, str]]:
    """
    Checks for dual dimension strings like "6.0 x 4.0 m", "6000 x 4000 mm".
    Returns (dim1_m, dim2_m, unit).
    """
    if not text:
        return None
    dual_pattern = r'(\d+(?:\.\d+)?)\s*(mm|cm|m)?\s*[xX*×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?'
    match = re.search(dual_pattern, text, re.IGNORECASE)
    if match:
        v1 = float(match.group(1))
        u1 = (match.group(2) or "").lower()
        v2 = float(match.group(3))
        u2 = (match.group(4) or "").lower()

        unit = u2 or u1 or ""
        if unit == "mm" or (not unit and v1 >= 500 and v2 >= 500):
            return (v1 / 1000.0, v2 / 1000.0, "mm")
        elif unit == "cm" or (not unit and 50 <= v1 <= 2000 and 50 <= v2 <= 2000 and not ('.' in match.group(1))):
            return (v1 / 100.0, v2 / 100.0, "cm")
        elif unit == "m" or (not unit and 1.0 <= v1 <= 40.0 and 1.0 <= v2 <= 40.0):
            return (v1, v2, "m")
    return None


# ==============================================================================
# OPENCV WALL & EXTERNAL BOUNDARY DETECTION PIPELINE
# ==============================================================================

def preprocess_floorplan(img_bgr: np.ndarray) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    Pipeline Step A: Image Preprocessing
    - Resizes large images appropriately to avoid excessive compute and keep lines crisp.
    - Converts image to grayscale.
    - Applies noise reduction using Gaussian Blur.
    - Computes combined Otsu + Adaptive Thresholding for wall extraction.
    Returns (resized_bgr, binary_walls, scale_factor).
    """
    h, w = img_bgr.shape[:2]
    max_dim = 1800
    scale_factor = 1.0

    if max(h, w) > max_dim:
        scale_factor = max_dim / float(max(h, w))
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        img_bgr = cv2.resize(img_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Convert to grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Noise reduction
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Adaptive thresholding to segment dark architectural lines on light paper
    # cv2.THRESH_BINARY_INV produces white foreground lines on black background
    adaptive = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 3
    )

    # Otsu thresholding as second pass
    _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Combine both thresholds to ensure solid line continuity
    binary = cv2.bitwise_or(adaptive, otsu)

    return img_bgr, binary, scale_factor


def detect_walls_and_envelope(
    binary: np.ndarray,
    img_bgr: np.ndarray
) -> Tuple[Optional[Tuple[int, int, int, int]], List[Tuple[int, int, int, int]]]:
    """
    Pipeline Step B: Wall and Boundary Detection
    - Uses directional morphological operations to extract horizontal & vertical architectural walls.
    - Uses Hough Line Transform (cv2.HoughLinesP) to detect prominent wall segments.
    - Filters out small furniture, symbols, doors, and decorative elements.
    - Uses OpenCV contour analysis to find the main outer structural envelope of the building.
    Returns (outer_bounding_box (x, y, w, h), list_of_detected_hough_wall_lines).
    """
    h, w = binary.shape[:2]
    total_area = h * w

    # Morphological kernels designed to isolate structural walls (>= 20px)
    # Floor plan walls are long straight lines; furniture/symbols are small or curved.
    kernel_len = max(15, int(min(h, w) * 0.025))
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_len, 1))
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, kernel_len))

    # Detect horizontal and vertical lines
    h_walls = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel)
    v_walls = cv2.morphologyEx(binary, cv2.MORPH_OPEN, v_kernel)

    # Combine horizontal and vertical wall structures
    wall_structure = cv2.bitwise_or(h_walls, v_walls)

    # Morphological close to bridge gaps at wall intersections and door openings
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    connected_walls = cv2.morphologyEx(wall_structure, cv2.MORPH_CLOSE, close_kernel)

    # Hough Line Transform to detect distinct structural wall lines
    detected_wall_lines: List[Tuple[int, int, int, int]] = []
    min_line_len = max(30, int(min(h, w) * 0.04))
    lines = cv2.HoughLinesP(
        connected_walls,
        rho=1,
        theta=np.pi / 180,
        threshold=40,
        minLineLength=min_line_len,
        maxLineGap=15
    )

    if lines is not None:
        for line in lines:
            pts = line.reshape(-1)
            if len(pts) >= 4:
                x1, y1, x2, y2 = int(pts[0]), int(pts[1]), int(pts[2]), int(pts[3])
                dx = abs(x2 - x1)
                dy = abs(y2 - y1)
                # Filter for predominantly horizontal or vertical lines (architectural walls)
                # Angle within ~15 deg of horizontal (dy <= dx * 0.28) or vertical (dx <= dy * 0.28)
                if dy <= dx * 0.28 or dx <= dy * 0.28:
                    detected_wall_lines.append((x1, y1, x2, y2))

    # Contour detection to locate outer building boundary
    # Dilate connected walls slightly to form a closed outer perimeter
    dilation_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dilated_for_contour = cv2.dilate(connected_walls, dilation_kernel, iterations=2)

    contours, _ = cv2.findContours(
        dilated_for_contour, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        # Fallback to direct binary contour search
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    valid_boxes = []
    for c in contours:
        x, y, bw, bh = cv2.boundingRect(c)
        area = bw * bh
        # The main shelter envelope must be substantial (>= 3% of drawing area),
        # but must not encompass the outer margin frame (> 94% of drawing area)
        if 0.03 * total_area <= area <= 0.94 * total_area:
            # Aspect ratio check: architectural rooms/buildings are rarely needle-thin (> 1:12)
            aspect = float(bw) / max(bh, 1)
            if 0.1 <= aspect <= 10.0:
                valid_boxes.append((x, y, bw, bh, area))

    if valid_boxes:
        # Choose the most prominent candidate (largest structural footprint)
        valid_boxes.sort(key=lambda b: b[4], reverse=True)
        outer_box = (valid_boxes[0][0], valid_boxes[0][1], valid_boxes[0][2], valid_boxes[0][3])
        return outer_box, detected_wall_lines

    # If no single contour matched, use Hough lines bounding envelope if available
    if detected_wall_lines:
        all_x = [pt for l in detected_wall_lines for pt in (l[0], l[2])]
        all_y = [pt for l in detected_wall_lines for pt in (l[1], l[3])]
        min_x, max_x = min(all_x), max(all_x)
        min_y, max_y = min(all_y), max(all_y)
        bw = max_x - min_x
        bh = max_y - min_y
        if bw * bh >= 0.03 * total_area and bw * bh <= 0.95 * total_area:
            return (min_x, min_y, bw, bh), detected_wall_lines

    # Fallback to largest non-trivial contour
    if contours:
        largest_c = max(contours, key=cv2.contourArea)
        x, y, bw, bh = cv2.boundingRect(largest_c)
        if bw * bh >= 0.02 * total_area:
            return (x, y, bw, bh), detected_wall_lines

    return None, detected_wall_lines


def draw_architectural_annotations(
    img_bgr: np.ndarray,
    outer_box: Optional[Tuple[int, int, int, int]],
    wall_lines: List[Tuple[int, int, int, int]],
    length_m: Optional[float],
    width_m: Optional[float],
    pixel_length: float,
    pixel_width: float,
    has_dimensions: bool,
    detected_scale: Optional[str]
) -> np.ndarray:
    """
    Renders high-visibility architectural dimensions, wall outlines, tick marks,
    and measurement badges using OpenCV graphics.
    """
    annotated = img_bgr.copy()
    img_h, img_w = annotated.shape[:2]

    # 1. Highlight detected structural wall lines in subtle slate/cyan
    for x1, y1, x2, y2 in wall_lines:
        cv2.line(annotated, (x1, y1), (x2, y2), (220, 150, 40), 2, cv2.LINE_AA)

    # 2. Draw outer building boundary and dimension markers
    if outer_box:
        bx, by, bw, bh = outer_box

        # Outer envelope rectangle (Forest Green)
        cv2.rectangle(annotated, (bx, by), (bx + bw, by + bh), (34, 110, 60), 3)

        # Subtle corner target accents
        corner_len = min(20, bw // 6, bh // 6)
        cv2.line(annotated, (bx, by), (bx + corner_len, by), (18, 70, 35), 4)
        cv2.line(annotated, (bx, by), (bx, by + corner_len), (18, 70, 35), 4)
        cv2.line(annotated, (bx + bw, by + bh), (bx + bw - corner_len, by + bh), (18, 70, 35), 4)
        cv2.line(annotated, (bx + bw, by + bh), (bx + bw, by + bh - corner_len), (18, 70, 35), 4)

        # Architectural dimension lines (Top horizontal & Left vertical)
        # Top dimension line
        line_y = max(by - 25, 20)
        cv2.line(annotated, (bx, line_y), (bx + bw, line_y), (20, 85, 45), 2)
        # End ticks
        cv2.line(annotated, (bx, line_y - 8), (bx, line_y + 8), (20, 85, 45), 2)
        cv2.line(annotated, (bx + bw, line_y - 8), (bx + bw, line_y + 8), (20, 85, 45), 2)

        # Left vertical dimension line
        line_x = max(bx - 25, 20)
        cv2.line(annotated, (line_x, by), (line_x, by + bh), (20, 85, 45), 2)
        # End ticks
        cv2.line(annotated, (line_x - 8, by), (line_x + 8, by), (20, 85, 45), 2)
        cv2.line(annotated, (line_x - 8, by + bh), (line_x + 8, by + bh), (20, 85, 45), 2)

        # Dimension Badges
        if has_dimensions and length_m and width_m:
            # Calibrated length label (top)
            lbl_l = f"Length: {length_m:.2f} m"
            center_x = bx + bw // 2
            cv2.rectangle(
                annotated,
                (center_x - 65, line_y - 26),
                (center_x + 65, line_y - 4),
                (20, 90, 45),
                -1
            )
            cv2.putText(
                annotated,
                lbl_l,
                (center_x - 58, line_y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

            # Calibrated width label (left)
            lbl_w = f"Width: {width_m:.2f} m"
            center_y = by + bh // 2
            cv2.rectangle(
                annotated,
                (max(line_x - 110, 5), center_y - 12),
                (max(line_x - 6, 95), center_y + 12),
                (20, 90, 45),
                -1
            )
            cv2.putText(
                annotated,
                lbl_w,
                (max(line_x - 105, 10), center_y + 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )
        else:
            # Uncalibrated pixel label badge
            lbl_l_px = f"Span: {int(bw)} px"
            center_x = bx + bw // 2
            cv2.rectangle(
                annotated,
                (center_x - 65, line_y - 26),
                (center_x + 65, line_y - 4),
                (160, 90, 20), # Amber badge for uncalibrated state
                -1
            )
            cv2.putText(
                annotated,
                lbl_l_px,
                (center_x - 55, line_y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

            lbl_w_px = f"Span: {int(bh)} px"
            center_y = by + bh // 2
            cv2.rectangle(
                annotated,
                (max(line_x - 110, 5), center_y - 12),
                (max(line_x - 6, 95), center_y + 12),
                (160, 90, 20),
                -1
            )
            cv2.putText(
                annotated,
                lbl_w_px,
                (max(line_x - 105, 10), center_y + 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

    return annotated


def analyze_floorplan_image(
    file_bytes: bytes,
    filename: str,
    reference_length_m: Optional[float] = None,
    reference_pixel_span: Optional[float] = None,
    scale_ratio: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main Computer Vision Floor Plan Dimension Detection Engine.
    Executes traditional OpenCV image processing:
    1. Preprocessing (Grayscale, blur, adaptive & Otsu binarization)
    2. Wall & Boundary Detection (Morphological kernels, HoughLinesP, external contour)
    3. Proportional Dimension Calculation & Scale Calibration
    4. Annotated Visual Verification Generation
    """
    # 1. Load and validate
    img_bgr = load_file_to_image(file_bytes, filename)
    orig_h, orig_w = img_bgr.shape[:2]

    # 2. Preprocess
    img_proc, binary, scale_factor = preprocess_floorplan(img_bgr)
    proc_h, proc_w = img_proc.shape[:2]

    # 3. Detect walls and outer building boundary
    outer_box_proc, wall_lines = detect_walls_and_envelope(binary, img_proc)

    # Scale outer_box back to original image coordinates if image was resized
    outer_box: Optional[Tuple[int, int, int, int]] = None
    if outer_box_proc:
        ob_x = int(outer_box_proc[0] / scale_factor)
        ob_y = int(outer_box_proc[1] / scale_factor)
        ob_w = int(outer_box_proc[2] / scale_factor)
        ob_h = int(outer_box_proc[3] / scale_factor)
        outer_box = (ob_x, ob_y, ob_w, ob_h)
        pixel_length = float(max(ob_w, ob_h))
        pixel_width = float(min(ob_w, ob_h))
    else:
        # Fallback if no specific building envelope found: use inner 80% span
        pixel_length = float(int(orig_w * 0.75))
        pixel_width = float(int(orig_h * 0.75))

    # 4. Dimension calculation & Scale calibration
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    detected_unit: Optional[str] = None
    detected_scale: Optional[str] = None
    confidence = 0.0
    has_dimensions = False
    message = ""

    parsed_scale = parse_scale_string(scale_ratio) if scale_ratio else None
    if parsed_scale:
        detected_scale = f"1:{int(parsed_scale)}"

    # CASE A: User provided a known reference measurement in meters (e.g. 6.0m)
    if reference_length_m and reference_length_m > 0:
        ref_span = reference_pixel_span if (reference_pixel_span and reference_pixel_span > 0) else pixel_length
        meters_per_pixel = reference_length_m / max(ref_span, 1.0)
        length_m = round(reference_length_m, 2)
        width_m = round(pixel_width * meters_per_pixel, 2)
        detected_unit = "m (user calibrated)"
        has_dimensions = True
        confidence = 0.95
        message = (
            f"Successfully calibrated floor plan from reference measurement of {reference_length_m:.2f} m: "
            f"detected Length = {length_m} m, Width = {width_m} m ({int(pixel_length)}px × {int(pixel_width)}px)."
        )

    # CASE B: Drawing scale ratio provided (e.g. 1:100, 1:50)
    elif parsed_scale and outer_box:
        # Standard screen/scan DPI: 144 DPI for rendered PDF, 96 DPI for screen/PNG
        dpi = 144.0 if filename.lower().endswith('.pdf') else 96.0
        # 1 inch = 0.0254 meters
        meters_per_pixel = (0.0254 / dpi) * parsed_scale
        calc_l = outer_box[2] * meters_per_pixel
        calc_w = outer_box[3] * meters_per_pixel
        length_m = round(max(calc_l, calc_w), 2)
        width_m = round(min(calc_l, calc_w), 2)
        detected_unit = "m (from scale)"
        has_dimensions = True
        confidence = 0.90
        message = (
            f"Detected architectural scale {detected_scale}. "
            f"Calculated dimensions from floor plan wall geometry: {length_m} m × {width_m} m."
        )

    # CASE C: Pure image with no scale information yet
    else:
        # Strict Rule: NEVER INVENT DIMENSIONS. Ask user to enter reference measurement
        has_dimensions = False
        length_m = None
        width_m = None
        detected_unit = "pixels"
        confidence = 0.70 if outer_box else 0.30
        message = (
            f"Floor plan boundary detected ({int(pixel_length)}px × {int(pixel_width)}px). "
            f"A 2D floor-plan image alone cannot reveal real-world meters without scale. "
            f"Please enter one known reference measurement (e.g. length in meters) or scale ratio below to calibrate."
        )

    # 5. Render visual dimension verification preview
    annotated = draw_architectural_annotations(
        img_proc,
        outer_box_proc,
        wall_lines,
        length_m,
        width_m,
        pixel_length,
        pixel_width,
        has_dimensions,
        detected_scale
    )

    preview_b64 = image_to_base64_data_url(annotated, ".png")
    raw_preview_b64 = image_to_base64_data_url(img_proc, ".png")

    return {
        "success": True,
        "has_dimensions": has_dimensions,
        "length_m": length_m,
        "width_m": width_m,
        "pixel_length": pixel_length,
        "pixel_width": pixel_width,
        "detected_unit": detected_unit,
        "detected_scale": detected_scale,
        "confidence": confidence,
        "message": message,
        "annotations": [],
        "preview_image": preview_b64,
        "raw_preview_image": raw_preview_b64,
        "image_width": orig_w,
        "image_height": orig_h,
        "outer_box": {
            "x": outer_box[0],
            "y": outer_box[1],
            "width": outer_box[2],
            "height": outer_box[3]
        } if outer_box else None
    }
