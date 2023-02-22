import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import '../Palette.css';

import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import chroma from "chroma-js";
import { MdFavoriteBorder, MdWbSunny } from 'react-icons/md'

type Color = string;

type PaletteProps = {
  colors: Color[],
  comment?: string,
  name: string,
  onSave: () => void;
  isSaved: boolean;
}

type StyleModes = "standard" | "dark" | "styled";

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

const copyCssPalette = (colors: Color[], names?: string[]) => {
  let str = ':root {\n';
  for (const i in colors) {
    str += '  --color-' + (i).toString() + ': ' + colors[i] + `;`;
    str += names == null ? '\n' : ` /* ${names[i]} */\n`;
  }
  str += '}';
  navigator.clipboard.writeText(str);
  defaultToast('📋 Copied CSS to clipboard');
}


function defaultToast(message: string) {
  return toast(message, {
    autoClose: 1500,
    position: "bottom-right",
    closeOnClick: true,
    draggable: true,
    theme: "light",
    hideProgressBar: true,
    transition: Zoom,
  })
}

const Palette = ({ colors, comment, name, onSave, isSaved }: PaletteProps) => {
  const [backgColor, setBackgColor] = useState<string>();
  const [textColor, setTextColor] = useState<string>();
  const [accentColor, setAccentColor] = useState<string>();
  const [secondColor, setSecondColor] = useState<string>();
  const [styleMode, setStyleMode] = useState<StyleModes>('standard');
  const [colorNames, setColorNames] = useState<Color[]>();

  const handleColorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const color = event.currentTarget.style.backgroundColor;
    const hex = chroma(color).hex().toUpperCase();
    navigator.clipboard.writeText(hex);
    defaultToast(`📋 Copied ${hex} to clipboard`)
  }

  const handleSaveClick = () => {
    console.log(isSaved)
    if (!isSaved) {
      onSave(); 
      defaultToast(`🖼️ Saved "${name}"`);
    }
    else {
      // defaultToast(`🥳 ${name} saved!`);
    }
  } 

  // brightness schenangigans
  const brightnesses = useMemo(() => colors.map(getBrightness), [colors])
  let darkestColor = colors[argmin(brightnesses)];
  let brighestColor = colors[argmax(brightnesses)]
  

  useEffect(() => {
    try {
      console.log("Brightest color:", Math.max(...brightnesses))
      console.log("Darkest color:", Math.min(...brightnesses))
      console.log("contrast:",chroma.contrast(darkestColor, brighestColor))
      if (chroma.contrast(darkestColor, brighestColor) > 4.5) {
        setStyleMode('styled')
      } else {
        setStyleMode('standard')
      }
    } catch (e) {
      console.log(e)
    }
  }, [colors])

  const labelColors = brightnesses.map(
    (brightness) => brightness > 215 ? darkestColor :
      brightness < 120 ? brighestColor : "white"
  );


  useEffect(() => {
    // set default colors
    setTextColor(darkestColor);
    setBackgColor(brighestColor);
    setSecondColor(brighestColor);

    let otherColors = colors.filter((color) => color !== darkestColor && color !== brighestColor)
    setAccentColor(otherColors[Math.floor(Math.random() * otherColors.length)])
  }, [colors])

  useEffect(() => {
    const getNames = async () => {
      let names: Color[] = [];
      for (let color of colors) {
        const name = await fetch(`https://api.color.pizza/v1/?values=${color.replace('#', '').trim()}`)
          .then((response) => response.json())
          .then((json) => json['paletteTitle'])
          .catch((e) => { console.log(e); return '' })
        console.log(name)
        names.push(name);
      }
      setColorNames(() => names)
    }
    setColorNames(() => [])
    getNames();
  }, [colors]);

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
          style={{ "color": match[0] }}
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
  const lightModeColor = "#EDF2F7"
  // fieldOptions.push.apply('inherit')

  // console.log(backgColor);
  // colors.sort((a,b) => getBrightness(a) - getBrightness(b))

  const styleColors = {
    backgroundColor: {
      "standard": lightModeColor,
      "dark": darkModeColor,
      "styled": backgColor,
    },
    textColor: {
      "standard": darkModeColor,
      "dark": lightModeColor,
      "styled": textColor,
    },
    secondaryColor: {
      "standard": lightModeColor,
      "dark": darkModeColor,
      "styled": secondColor,
    },
    accentColor: {
      "standard": lightModeColor,
      "dark": darkModeColor,
      "styled": accentColor,
    }
  }
  const dynamicTextColor = styleColors.textColor[styleMode]?.trim();
  const dynamicBackgColor = styleColors.backgroundColor[styleMode]?.trim();
  const dynamicSecondaryColor = styleColors.secondaryColor[styleMode]?.trim();
  const dynamicAccentColor = styleColors.accentColor[styleMode]?.trim();

  return (
    <div className='paletteBody'
      style={{ backgroundColor: dynamicBackgColor, color: dynamicTextColor }}
    >
      <h1 className='palette-title'>{name}</h1>
      <div className="palette">
        {colors.map((color, i) => {
          const isBackgColor = color === dynamicBackgColor;
          const borderColor = isBackgColor ? accentColor : dynamicBackgColor;
          const textOpacity = '';
          return (
            <div key={i} style={{
              backgroundColor: color,
              borderColor: borderColor
            }}
              className={"color" + (isBackgColor ? " shadow" : "")}
              onClick={handleColorClick}
            >
              {/* The hover text */}
              <div className="color-label" style={{ color: labelColors[i], opacity: textOpacity }}>
                {colorNames?.[i]} <br /> {color}
              </div>

            </div>
          )
        })}
        <ToastContainer
          limit={3}
        />
      </div>
      {commentHtml != null && <>{commentHtml}</>}
      <hr className='divider' style={{ borderColor: chroma(dynamicTextColor as string).alpha(.2).hex() }} />
      <div className='bottom-bar' style={{ backgroundColor: dynamicSecondaryColor }}>
        <div className='action-buttons'>
          <button title='Toggle Preview' className='bar-button' style={{ borderColor: textColor }}
            onClick={() => setStyleMode(styleMode === 'styled' ? 'standard' : 'styled')}>
            🎨
          </button>
          <button title='Toggle Dark Mode' className='bar-button' style={{ borderColor: textColor }}
            onClick={() => setStyleMode(styleMode === 'dark' ? 'standard' : 'dark')}>
            🌙
          </button>
          <button title='Copy' className='bar-button' style={{ borderColor: textColor }}
            onClick={() => copyCssPalette(colors, colorNames)}>
            📋
          </button>
        </div>

        <div>
          {/* TODO: regenerate button?  */}
          <button title='Favorite' className='bar-button big' style={{ borderColor: textColor }}          
            onClick={() => handleSaveClick()}>
            {isSaved ? "💔" : "❤️"}
          </button>
        </div>
      </div>
    </div>
  );
};



export default Palette;
