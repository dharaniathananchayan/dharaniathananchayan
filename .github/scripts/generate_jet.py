import random

def generate_jet_heatmap_svg(theme="dark"):
    is_dark = theme == "dark"
    bg_color = "#0D1117" if is_dark else "#FFFFFF"
    border_color = "#2D1557" if is_dark else "#E9D5FF"
    
    if is_dark:
        colors = ["#161B22", "#2D1557", "#4C1D95", "#8B5CF6", "#A78BFA"]
        jet_color = "#A78BFA"
        jet_stroke = "#E9D5FF"
        cockpit_color = "#38BDF8"
        text_color = "#A78BFA"
        sub_text_color = "#6E7681"
        laser_color = "#EC4899"
    else:
        colors = ["#EBEDF0", "#E9D5FF", "#C084FC", "#9333EA", "#6B21A8"]
        jet_color = "#7C3AED"
        jet_stroke = "#4C1D95"
        cockpit_color = "#0284C7"
        text_color = "#6B21A8"
        sub_text_color = "#57534E"
        laser_color = "#D97706"

    random.seed(42)

    weeks = 52
    days_per_week = 7
    cell_size = 11
    cell_gap = 3
    margin_x = 45
    margin_y = 40

    svg_width = margin_x + weeks * (cell_size + cell_gap) + 25
    svg_height = margin_y + days_per_week * (cell_size + cell_gap) + 35

    svg_lines = []
    svg_lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}" width="100%" height="100%">')
    svg_lines.append('<style>')
    svg_lines.append(f'''
      @keyframes fly {{
        0% {{ transform: translate(-60px, 35px); }}
        40% {{ transform: translate(320px, 15px); }}
        70% {{ transform: translate(580px, 45px); }}
        100% {{ transform: translate({svg_width + 60}px, 25px); }}
      }}
      @keyframes flame-glow {{
        0%, 100% {{ transform: scaleX(1); opacity: 0.85; }}
        50% {{ transform: scaleX(1.4); opacity: 1; }}
      }}
      @keyframes laser-pulse {{
        0%, 100% {{ opacity: 0.2; stroke-width: 1.5; }}
        50% {{ opacity: 0.9; stroke-width: 2.5; }}
      }}
      .jet-assembly {{
        animation: fly 9s cubic-bezier(0.4, 0.0, 0.6, 1) infinite;
      }}
      .jet-flame {{
        animation: flame-glow 0.25s infinite;
        transform-origin: left center;
      }}
      .laser-line {{
        animation: laser-pulse 0.4s infinite;
      }}
    ''')
    svg_lines.append('</style>')

    # Background card
    svg_lines.append(f'<rect width="{svg_width}" height="{svg_height}" fill="{bg_color}" rx="8" stroke="{border_color}" stroke-width="1.5"/>')

    # Header Title
    svg_lines.append(f'<text x="20" y="25" fill="{text_color}" font-family="-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif" font-size="14" font-weight="700">✈️ GitHub Jet Heatmap</text>')
    
    # Months labels
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i, month in enumerate(months):
        x_pos = margin_x + i * 4.3 * (cell_size + cell_gap)
        svg_lines.append(f'<text x="{x_pos}" y="35" fill="{sub_text_color}" font-family="sans-serif" font-size="9">{month}</text>')

    # Contribution Grid
    for w in range(weeks):
        for d in range(days_per_week):
            x = margin_x + w * (cell_size + cell_gap)
            y = margin_y + d * (cell_size + cell_gap)
            
            rand_val = random.random()
            if rand_val < 0.65:
                level = 0
            elif rand_val < 0.82:
                level = 1
            elif rand_val < 0.92:
                level = 2
            elif rand_val < 0.97:
                level = 3
            else:
                level = 4

            cell_color = colors[level]
            svg_lines.append(f'<rect x="{x}" y="{y}" width="{cell_size}" height="{cell_size}" fill="{cell_color}" rx="2"/>')

    # Animated Jet Airplane
    svg_lines.append('<g class="jet-assembly">')
    
    # Thruster Flame & Exhaust
    svg_lines.append(f'<path class="jet-flame" d="M -30,0 L -8,-5 L -2,0 L -8,5 Z" fill="#F59E0B" filter="drop-shadow(0 0 6px #EF4444)"/>')
    svg_lines.append(f'<path class="jet-flame" d="M -42,0 L -12,-3 L -4,0 L -12,3 Z" fill="#EC4899"/>')

    # Jet Fighter Silhouette
    jet_path = "M 35,0 L 15,-5 L -5,-6 L -16,-20 L -10,-20 L 2,-5 L -12,-5 L -20,-2 L -20,2 L -12,5 L 2,5 L -10,20 L -16,20 L -5,6 L 15,5 Z"
    svg_lines.append(f'<path d="{jet_path}" fill="{jet_color}" stroke="{jet_stroke}" stroke-width="1.2"/>')
    
    # Cockpit Glass
    svg_lines.append(f'<ellipse cx="10" cy="0" rx="7" ry="2.8" fill="{cockpit_color}" opacity="0.85"/>')

    # Laser targeting lines
    svg_lines.append(f'<line class="laser-line" x1="25" y1="2" x2="60" y2="45" stroke="{laser_color}" stroke-dasharray="4,2"/>')
    svg_lines.append(f'<line class="laser-line" x1="25" y1="-2" x2="80" y2="25" stroke="{laser_color}" stroke-dasharray="3,3"/>')

    svg_lines.append('</g>')
    svg_lines.append('</svg>')

    return '\n'.join(svg_lines)

if __name__ == '__main__':
    with open("dark.svg", "w", encoding="utf-8") as f:
        f.write(generate_jet_heatmap_svg("dark"))

    with open("light.svg", "w", encoding="utf-8") as f:
        f.write(generate_jet_heatmap_svg("light"))
