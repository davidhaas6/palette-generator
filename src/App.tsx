import { useState, useEffect } from 'react';
import './App.css';
import Palette from './components/Palette';
import Sidebar from './components/Sidebar';
import { getHexDiscussionPrompt, getColorPaletteHex} from './prompt';
import { toast } from 'react-hot-toast';
import Loader from './components/Loader';

type Color = string;

type Palette = {
  name: string,
  colors: Color[],
  comment?: string,
}

async function getColorPaletteGCP(query: string, verbose?: boolean): Promise<string> {
  const requestBody = {
    "prompt": getHexDiscussionPrompt(query),
  }
  const response = await fetch("https://generate-palette-hp5qzv2j6a-uc.a.run.app", {
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    method: "POST"
  });
  console.log(response);
  const text = await response.text();
  return text;
}

function App() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState('');
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the data from the API
  useEffect(() => {
    const fetchData = async () => {
      // console.log("fetching data for: ", queryText)
      try {
        const text = await getColorPaletteGCP(queryText, true);
        if (text !== "") {
          let colorText = text;
          if (text.includes(';')) {
            colorText = text.split(';')[0];
            let discussion = text.split(';')[1];
            setComment(discussion);
          }
          const colors = colorText?.trim().split(',');
          setColors(() => colors);
        }

      } catch (error: any) {
        console.log(error)
      }
      setQueryText('');
      setLoading(false);
    }
    if (queryText.length > 0) {
      setLoading(true);
      fetchData();
    }
  }, [queryText]);

  useEffect(() => {
    // Load the saved palettes from local storage
    const savedPalettes = localStorage.getItem('palettes');
    if (savedPalettes) {
      setPalettes(() => JSON.parse(savedPalettes) as Palette[]);
    }
  }, []);

  useEffect(() => {
    // Save the palettes to local storage
    if (palettes.length > 0) {
      localStorage.setItem('palettes', JSON.stringify(palettes));
    }
  }, [palettes]);

  const generatePalette = () => {
    setQueryText(name);
  }

  const colorsInSaved = (queryColors: Color[]) => {
    for (const existingPalette of palettes) {
      if (queryColors.every((color, i) => color === existingPalette.colors[i])) {
        return true;
      }
    }
    return false;
  }

  const savePalette = () => {
    const newPalette: Palette = {
      name,
      colors,
      comment
    };
    if (!colorsInSaved(colors))
      setPalettes(() => [newPalette, ...palettes]);
    else
      toast('Color already saved!')
  }

  const loadPalette = (palette: Palette) => {
    setColors(() => palette.colors);
    setComment(() => palette.comment ?? '');
    setName(() => palette.name)
  }

  const copyPalette = () => {
    navigator.clipboard.writeText(colors.toString());
  }

  const copyCssPalette = () => {
    let str = ':root {\n';
    for (const i in colors) {
      str += '  --color-' + (i).toString() + ': ' + colors[i] + ';\n';

    }
    str += '}';
    navigator.clipboard.writeText(str);
  }

  return (
    <>
      <div className="App">
        {palettes.length > 0 && <Sidebar palettes={palettes} onPaletteClick={loadPalette} />}

        <div className="Body">
          <div className='header' />
          <div className="toolbar">
            <input type="text" value={name} onChange={event => setName(event.target.value)} />
            <button onClick={generatePalette}>Generate Palette</button>
            <button onClick={savePalette} className={colorsInSaved(colors) ? "disabled" : ""}>
              Save Palette
            </button>
            {colors.length > 0 &&
              <div>
                <button onClick={copyPalette}>Copy Hex</button>
                <button onClick={copyCssPalette}>Copy CSS</button>
              </div>
            }
          </div>
          {loading ?
            <Loader />:<Palette name={name} colors={colors} comment={comment} />
          }
        </div>
      </div>
    </>
  );
}

export default App;


