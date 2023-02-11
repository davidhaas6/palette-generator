import { useState, useEffect } from 'react';
import './App.css';
import Palette from './components/Palette';
import Sidebar from './components/Sidebar';
import { getHexDiscussionPrompt } from './prompt';

import { Configuration, OpenAIApi } from 'openai';
import { toast } from 'react-hot-toast';
import { RingLoader } from 'react-spinners';
import Loader from './components/Loader';

const configuration = new Configuration({
  apiKey: "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", //todo: bad
});
const openai = new OpenAIApi(configuration);

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
    },
    method: "POST"
  });
  console.log(response);
  const text = await response.text();
  return text;
}


async function getColorPalette(query: string, verbose?: boolean): Promise<Color> {
  const prompt = getHexDiscussionPrompt(query);
  if (verbose) {
    console.log("prompt: ", prompt)
  }
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.8,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
  if (verbose) {
    console.log(response.data);
  }
  if ('choices' in response.data && response.data.choices.length > 0) {
    const respText = response.data.choices[0].text;
    if (respText != null) {
      return respText;
    }
  }
  return "";
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
        <Sidebar palettes={palettes} onPaletteClick={loadPalette} />

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


