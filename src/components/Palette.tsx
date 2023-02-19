import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import '../Palette.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Color = string;

type PaletteProps = {
  colors: Color[],
  comment?: string,
  name: string,
}

const notify = () => toast('Here is your toast.');

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

function colorSelect(label: string, colors: Color[], onSelect: (_: string) => void) {
  return (
    <div className='bar-field'>
      <div>{label}</div>
      <select onChange={(event) => onSelect(event.target.value)}>
        {colors.map((color) =>
          <option value={color} style={{ backgroundColor: color }} >{color}</option>
        )}
      </select>
    </div>
  )
}


const Palette = ({ colors, comment, name }: PaletteProps) => {
  const [backgColor, setBackgColor] = useState<string>();
  const [textColor, setTextColor] = useState<string>();
  const [accentColor, setAccentColor] = useState<string>();
  const [secondColor, setSecondColor] = useState<string>();
  const [darkMode, setDarkMode] = useState(false);

  const notify = () => toast("Color Copied");

  const handleColorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const color = event.currentTarget.style.backgroundColor;
    navigator.clipboard.writeText(color);
    toast(`Copied ${color} to clipboard`, {
      autoClose: 1500,
      position: "top-right",
      closeOnClick: true,
      draggable: true,
      theme: "light"
    })
  }

  // brightness schenangigans
  const brightnesses = useMemo(() => colors.map(getBrightness), [colors])
  let darkestColor = colors[argmin(brightnesses)];
  let brighestColor = colors[argmax(brightnesses)]

  useEffect(() => {
    // set defaul colors
    setTextColor(darkestColor);
    setBackgColor(brighestColor);
    setSecondColor(brighestColor);

    let otherColors = colors.filter((color) => color !== darkestColor && color !== brighestColor)
    console.log("other:",otherColors);
    console.log("choice1:", otherColors[Math.floor(Math.random()*otherColors.length)])
    setAccentColor(otherColors[Math.floor(Math.random()*otherColors.length)])
    console.log("updating colors")
  }, [colors])
  
  // console.log("brightnesses:", brightnesses)

  if (Math.min(...brightnesses) > 200) darkestColor = 'black';
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


  let fieldOptions = colors.concat(['inherit']);
  const darkModeColor = "#2C2A2B"
  // fieldOptions.push.apply('inherit')

  // console.log(backgColor);
  // colors.sort((a,b) => getBrightness(a) - getBrightness(b))
  return (
    <div className='paletteBody'
      style={{ backgroundColor: darkMode ? darkModeColor : backgColor, color: textColor }}
    >
      <h1 className='palette-title'>{name}</h1>
      <div className="palette">
        {colors.map((color, i) => (
          <div key={i} style={{ backgroundColor: color, borderColor:accentColor }} className="color" onClick={handleColorClick}>
            {/* The hover text */}
            <div className="color-label" style={{ color: labelColors[i] }}>{color}</div>

          </div>
        ))}
        <ToastContainer limit={3} />
      </div>
      {commentHtml != null && <>{commentHtml}</>}
      <div className='bottom-bar' style={{ backgroundColor: secondColor }}>
        {colorSelect("Text", fieldOptions.concat([darkModeColor]), setTextColor)}
        {colorSelect("Background", fieldOptions.concat('#edf2f7'), setBackgColor)}
        {colorSelect("Secondary", fieldOptions.concat('#edf2f7'), setSecondColor)}
        {colorSelect("Accent", fieldOptions, setAccentColor)}

        <button onClick={() => setDarkMode((mode) => !mode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};



export default Palette;
