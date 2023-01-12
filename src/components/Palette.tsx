import React, { ReactElement } from 'react';
import '../Palette.css';

type Color = string;

type PaletteProps = {
  colors: Color[],
  comment?: string,
  name: string,
}

const Palette = ({ colors, comment, name }: PaletteProps) => {
  const handleColorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const color = event.currentTarget.style.backgroundColor;
    navigator.clipboard.writeText(color);
  }

  let commentHtml: ReactElement = <span className='palette-comment'>{comment}</span>;;
  if (comment != null) {
    const hexRegex = /#[a-fA-F0-9]{6}/g;
    let prevIdx = 0;
    let commentPieces = [];
    const matches = [...comment.matchAll(hexRegex)]
    for (const match of matches) {
      if (match.index != null) {
        commentPieces.push(<span key={prevIdx}>{comment.substring(prevIdx, match.index)}</span>);
        commentPieces.push(<span className="hex-text" key={match[0]} style={{"color": match[0]}}>{match[0]}</span>);
        prevIdx = match.index + match[0].length;
      }
    }
    if(commentPieces.length === 0) {
      commentPieces.push(comment);
    }
    commentHtml = <span className='palette-comment'>{commentPieces}</span>;
  } 

  return (
    <div>
      <span>{name}</span>
      <div className="palette">
        {colors.map((color, index) => (
          <div key={index} style={{ backgroundColor: color }} className="color" onClick={handleColorClick}>
            <span className="color-hex">{color}</span>
          </div>
        ))}
      </div>
      {commentHtml != null && <span className='palette-comment'>{commentHtml}</span>}
    </div>
  );
};

export default Palette;
