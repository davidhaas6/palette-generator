import React from 'react';

type Color = string;

type Palette = {
  name: string,
  colors: Color[],
}

type SidebarProps = {
  palettes: Palette[],
  onPaletteClick: (p: Palette) => void;
}

const Sidebar = ({ palettes, onPaletteClick }: SidebarProps) => {
  return (
    <div className="sidebar">
      {palettes.map((palette, index) => (
        <div key={index} className="saved-palette" onClick={() => onPaletteClick(palette)}>
          
          <div className="saved-colors" title={palette.name}>
            {palette.colors.map((color, index) => (
              <div key={index} style={{ backgroundColor: color }} className="saved-color">
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
