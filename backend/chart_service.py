import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from typing import List
from .models import HourlyPoint

def generate_temperature_chart(hourly_data: List[HourlyPoint]) -> bytes:
    """
    Generates a 24-hour diurnal temperature graph using Matplotlib.
    Matches the AASHRAY Results page visual design:
      - Indoor temperature: Green solid line (#064C42) with circular dots
      - Outdoor temperature: Blue dotted line (#3B82F6) with circular dots
      - Coldest hour marker at 02:00 (#1E40AF)
      - Sunrise marker at 06:00 (#F59E0B)
      - Sunset marker at 18:00 (#EA580C)
      - Grid lines (#ECEAE0)
      - 24-hour X-axis labels (00:00 to 23:00)
      - Temperature Y-axis labels with °C unit
    """
    if not hourly_data:
        raise ValueError("hourly_data cannot be empty")

    plt.rcParams['font.sans-serif'] = ['Segoe UI', 'DejaVu Sans', 'Arial', 'Segoe UI Emoji', 'sans-serif']
    
    hours = [p.hour for p in hourly_data]
    labels = [p.time_label for p in hourly_data]
    indoor = [p.indoor_temp for p in hourly_data]
    outdoor = [p.outdoor_temp for p in hourly_data]

    fig, ax = plt.subplots(figsize=(11, 3.4), dpi=150)
    try:
        fig.patch.set_facecolor('#FFFFFF')
        ax.set_facecolor('#FFFFFF')

        # Gridlines matching Recharts CartesianGrid strokeDasharray="3 3" stroke="#ECEAE0"
        ax.grid(True, linestyle='--', dashes=(3, 3), color='#ECEAE0', alpha=1.0, zorder=1)

        # Plot curves
        # Green solid line for Indoor Temp: stroke="#064C42", strokeWidth=3.5
        ax.plot(
            hours,
            indoor,
            color='#064C42',
            linewidth=3.2,
            linestyle='-',
            marker='o',
            markersize=4.5,
            markerfacecolor='#064C42',
            markeredgecolor='#064C42',
            label='Indoor Temp (°C)',
            zorder=4
        )

        # Blue dotted line for Outdoor Temp: stroke="#3B82F6", strokeWidth=2, strokeDasharray="4 4"
        ax.plot(
            hours,
            outdoor,
            color='#3B82F6',
            linewidth=2.0,
            linestyle='--',
            dashes=(4, 4),
            marker='o',
            markersize=3.5,
            markerfacecolor='#3B82F6',
            markeredgecolor='#3B82F6',
            label='Outdoor Temp (°C)',
            zorder=3
        )

        # Compute Y limits with room for top reference annotations
        y_min = min(min(indoor), min(outdoor))
        y_max = max(max(indoor), max(outdoor))
        span = max(5.0, y_max - y_min)
        ax.set_ylim(y_min - span * 0.08, y_max + span * 0.22)
        y_top_ref = y_max + span * 0.16

        # Reference lines
        # 02:00 - Coldest night hour: stroke="#1E40AF" strokeDasharray="4 4"
        ax.axvline(x=2, color='#1E40AF', linestyle='--', dashes=(4, 4), linewidth=1.5, zorder=2)
        ax.text(2.1, y_top_ref, '2 AM (Coldest)', color='#1E40AF', fontsize=9.5, fontweight='bold', va='top', ha='left', zorder=5)

        # 06:00 - Sunrise: stroke="#F59E0B" strokeDasharray="4 4"
        ax.axvline(x=6, color='#F59E0B', linestyle='--', dashes=(4, 4), linewidth=1.5, zorder=2)
        ax.text(6.1, y_top_ref, 'Sunrise', color='#B45309', fontsize=9.5, fontweight='bold', va='top', ha='left', zorder=5)

        # 18:00 - Sunset: stroke="#EA580C" strokeDasharray="4 4"
        ax.axvline(x=18, color='#EA580C', linestyle='--', dashes=(4, 4), linewidth=1.5, zorder=2)
        ax.text(18.1, y_top_ref, 'Sunset', color='#C2410C', fontsize=9.5, fontweight='bold', va='top', ha='left', zorder=5)

        # X-axis configuration
        ax.set_xlim(-0.5, len(hours) - 0.5)
        ax.set_xticks(hours)
        ax.set_xticklabels(labels, fontsize=8.5, color='#8C8A7B', rotation=0)

        # Y-axis configuration
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{int(round(y))}°C"))
        ax.tick_params(axis='y', colors='#8C8A7B', labelsize=9.5)
        ax.tick_params(axis='x', colors='#8C8A7B', length=4)

        # Spine styling
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color('#D5D3C5')
        ax.spines['bottom'].set_color('#D5D3C5')

        fig.tight_layout()

        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        buf.seek(0)
        return buf.getvalue()
    finally:
        plt.close(fig)
