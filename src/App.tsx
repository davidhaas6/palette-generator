import { useState, useEffect } from 'react';
import './App.css';
import Palette from './components/Palette';
import Sidebar from './components/Sidebar';
import { FetchInfo } from './hooks';

import { Configuration, OpenAIApi } from 'openai';

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

function getHexPrompt(query: string) {
  return "a five-color color palette for " + query + "\ncomma-delimited list of hex codes:";
}

function getHexDiscussionPrompt(query: string) {
  return "a five-color color palette for " + query + ". First, output a comma-delimited list of hex codes. Then output a semicolon and briefly discuss aspects of the palette with respect to the prompt:"
}

async function getColorPalette(query: string, verbose?: boolean) {
  const prompt = getHexDiscussionPrompt(query);
  if(verbose != null) {
    console.log("prompt: ",prompt)
  }
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.8,
    max_tokens: 120,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
  return response;
}

function App() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState('');
  const [queryText, setQueryText] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      // Fetch the data from the API
      // console.log("fetching data for: ", queryText)
      try {
        const response = await getColorPalette(queryText,true);
        console.log(response.data);
        if ('choices' in response.data && response.data.choices.length > 0) {
          const respText = response.data.choices[0].text;
          console.log("response: ", respText);
          if (respText != null) {
            let colorText = respText;
            if (respText.includes(';')) {
              colorText = respText.split(';')[0];
              let discussion = respText.split(';')[1];
              setComment(discussion);
            } 
            const colors = colorText?.trim().split(',');
            setColors(() => colors);
            console.log("colors: ", respText?.trim().split(','));
          }
        }
      } catch (error: any) {
        console.log(error)
      }

      setQueryText('');
    }
    if (queryText.length > 0) {
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
    <div className="App">
      <Sidebar palettes={palettes} onPaletteClick={loadPalette} />
      <div className="Body">
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
        <Palette name={name} colors={colors} comment={comment} />
      </div>
    </div>
  );
}

export default App;


