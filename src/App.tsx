import { useState, useEffect } from 'react';
import './App.css';
import Palette from './components/Palette';
import Sidebar from './components/Sidebar';
import { getHexDiscussionPrompt, getColorPaletteHex } from './prompt';
// import { toast } from 'react-hot-toast';
import Loader from './components/Loader';

type Color = string;

type Palette = {
  name: string,
  colors: Color[],
  comment?: string,
}

function b64DecodeUnicode(str: string) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function (c): string {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

async function getColorPaletteGCP(query: string, verbose?: boolean): Promise<string> {
  console.log("Request:", getHexDiscussionPrompt(query))
  const requestBody = {
    "prompt": getHexDiscussionPrompt(query),
    "query": "",
    "pw": "nice meme"
  }
  //aHR0cHM6Ly90ZXN0LXBhbGV0dGUtZ2VuZXJhdG9yLWhwNXF6djJqNmEtdWMuYS5ydW4uYXBw
  //aHR0cHM6Ly9nZW5lcmF0ZS1wYWxldHRlLWhwNXF6djJqNmEtdWMuYS5ydW4uYXBw
  const response = await fetch(b64DecodeUnicode("aHR0cHM6Ly90ZXN0LXBhbGV0dGUtZ2VuZXJhdG9yLWhwNXF6djJqNmEtdWMuYS5ydW4uYXBw"), {
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*"
    },
    method: "POST"
  });
  console.log(response);
  const text = await response.text();
  return text;
}

const placeholderTexts = [
  'Warm summer nights',
  'a pastel sunset',
  'Dark green',
  'A sleek website for a law firm',
  'A beautiful Appalachian sunset',
  'A rustic cafe in southern France',
  'Sad red vibes',
  'Colors that work well with #F6B5B5',
  'A palette that pairs well with #8E8C6D and #D2A26F'
]

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
          console.log("Response: ", text)
          let colorText = text;
          if (text.includes(';')) {
            colorText = text.split(';')[0];
            let discussion = text.split(';')[1];
            setComment(discussion);
          }
          const max_colors = 5;
          const regex = /([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
          let colors = (colorText.match(regex) || []).slice(0, max_colors);
          colors = colors.map((color) => "#" + color)
          // const colors = colorText?.trim().split(',');
          setColors(() => colors);
        }

      } catch (error: any) {
        console.log(error)
      }
      setQueryText('');
      setLoading(false);
    }
    if (queryText.length > 0) {
      console.log("Loading: ", queryText)
      setLoading(true);
      fetchData();
    }
  }, [queryText]);

  // Load the saved palettes from local storage
  useEffect(() => {
    const savedPalettes = localStorage.getItem('palettes');
    if (savedPalettes) {
      setPalettes(() => JSON.parse(savedPalettes) as Palette[]);
    }
  }, []);

  // Save the palettes to local storage
  useEffect(() => {
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
    else { }
    // toast('Color already saved!')
  }

  const loadPalette = (palette: Palette) => {
    if (colors.length > 0 && colors.every((color, i) => color === palette.colors[i])) {
      setColors(() => []);
      setComment('');
      setName('');
      console.log("colors match. aborting", palette.colors, colors)
    } else {
      setColors(() => palette.colors);
      setComment(() => palette.comment ?? '');
      setName(() => palette.name)
    }
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

  const colorsSaved = colorsInSaved(colors);

  const searchPlaceholder = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)]
  // console.log(colors)
  return (
    <>
      <div className="App">
        {palettes.length > 0 && <Sidebar palettes={palettes} onPaletteClick={loadPalette} />}

        <div className="Body">
          <div className='header' >spectrimo</div>
          <div className='subheader'>Smart and Fun AI-Generated Color Palettes</div>
          <div className="toolbar">

            <input type="text" value={name} placeholder={searchPlaceholder}
              onChange={event => setName(event.target.value)} className='text-input' />
              <button className='button' onClick={generatePalette}>Create</button>

          </div>

          {/* Main body */}
          { loading ? <Loader />  :
            colors.length === 0 ? <></> :
             <Palette name={name} colors={colors} comment={comment} onSave={savePalette} isSaved={colorsSaved} />
          }
        </div>
      </div>
    </>
  );
}

export default App;


