import React, { ReactElement } from 'react';
import '../Palette.css';
import toast, { Toaster } from 'react-hot-toast';
import internal from 'stream';

type Color = string;

type PaletteProps = {
  colors: Color[],
  comment?: string,
  name: string,
}

export function getBrightness(hexColor: string): number {
  let rgb = hexToRgb(hexColor);
  if (rgb == null) return -1;
  return Math.sqrt(0.299 * rgb.R ** 2 + 0.587 * rgb.G ** 2 + 0.114 * rgb.B ** 2);
}


function hexToRgb(hex: string) {
  var result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/g.exec(hex.toLowerCase());
  return result ? {
    R: parseInt(result[1], 16),
    G: parseInt(result[2], 16),
    B: parseInt(result[3], 16)
  } : null;
}


function argmin(arr: number[]): number {
  return arr.indexOf(Math.min(...arr));
}

function argmax(arr: number[]): number {
  return arr.indexOf(Math.max(...arr));
}


const Palette = ({ colors, comment, name }: PaletteProps) => {
  const handleColorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const color = event.currentTarget.style.backgroundColor;
    navigator.clipboard.writeText(color);
    toast('Copied color to clipboard!')
  }

  // brightness schenangigans
  let brightnesses = colors.map(getBrightness);
  console.log("brightnesses:", brightnesses)
  let darkestColor = colors[argmin(brightnesses)];
  if (Math.min(...brightnesses) > 200) darkestColor = 'black';
  let brighestColor = colors[argmax(brightnesses)]
  if (Math.max(...brightnesses) < 180) brighestColor = 'white';

  let labelColors = brightnesses.map(
    (brightness) => brightness > 215 ? darkestColor : 
                    brightness < 120 ? brighestColor : 
                    "white"
  );


  let commentHtml: ReactElement = <span className='palette-comment'>{comment}</span>;;
  if (comment != null) {
    const hexRegex = /#[a-fA-F0-9]{6}/g;
    let prevIdx = 0;
    let commentPieces = [];
    const matches = [...comment.matchAll(hexRegex)]
    for (const match of matches) {
      if (match.index != null) {
        commentPieces.push(<span key={prevIdx}>{comment.substring(prevIdx, match.index)}</span>);
        commentPieces.push(<span 
          className="hex-text" key={match[0]} 
          style={{ "color": match[0], "backgroundColor": match[0] === brighestColor ? darkestColor : 'white' }}
        >{match[0]}</span>);
        prevIdx = match.index + match[0].length;
      }
    }
    if (commentPieces.length === 0) {
      commentPieces.push(comment);
    }
    commentHtml = <div className='palette-comment'>{commentPieces}</div>;
  }

  // colors.sort((a,b) => getBrightness(a) - getBrightness(b))
  return (
    <div className='paletteBody'>
      <span>{name}</span>
      <div className="palette">
        {colors.map((color, i) => (
          <div key={i} style={{ backgroundColor: color }} className="color" onClick={handleColorClick}>
            {/* The hover text */}
            <div className="color-label" style={{ color: labelColors[i] }}>{color}   {Math.round(brightnesses[i])}</div>
          </div>
        ))}
      </div>
      {commentHtml != null && <>{commentHtml}</>}
    </div>
  );
};



export default Palette;
