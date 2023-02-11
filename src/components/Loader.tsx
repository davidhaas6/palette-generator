import { FunctionComponent, useEffect, useState } from "react";
import { RingLoader } from "react-spinners";

interface LoaderProps {
  color?: string;
}

const DISP_TEXT = [
  'Finding the right hue...',
  'Adding a splash of excitement...',
  'Mixing perfect shades...',
  'Coordinating the universe...',
  'Getting advice from SkyNet...',
  'Asking Davinci for some help...',

  "Building your color scheme...",
  "Crafting the ideal palette...",
  "Discovering vibrant colors...",
  "Perfecting hues and tones...",
  "Synchronizing colors...",
  "Brightening your day...",
  "Mixing beauty and elegance...",
  "Finding the perfect mix...",
  "Bringing color to life...",
  "Teaching machines to love color...",

  "Organizing crayons...",
  "Fighting off color-stealing robots...",
  "Plotting a color takeover...",
  "Racing unicorns for color supremacy...",
  "Installing rainbow lasers...",
  "Finding lucky color socks...",

  "Fine-tuning color sensors...",
  "Analyzing the color data...",
  "Reinventing the color wheel...",
  "Generating a color breakthrough...",

  "Teleporting rainbows...",
  "Battling color dragons...",
  "Inventing new colors...",
  "Sculpting with light...",

  "Perfecting the art of chromatics...",
  "Dancing with the color spectrum...",
  "Decoding the color universe...",
  "Mastering the laws of color physics...",
  "Innovating in the field of chromology...",
  "Navigating the color dimension...",
  "Harnessing the power of color energy...",
  "Transcending the boundaries of color...",

  "Getting inspired by Van Gogh...",
  "Painting like Picasso in pixels...",
  "Bringing Monet's hues to life...",
  "Emulating Warhol's pop...",
  "Translating Mondrian's blocks...",
  "Channelling Klimt's golden tones...",
  "Echoing Frida's vibrant palettes...",
  "Reimagining Kandinsky's abstractions...",
  "Resurrecting Rothko's color fields...",
  "Recreating Hockney's swimming pools..."
];

function randText() {
  const sample = DISP_TEXT[Math.floor(Math.random() * DISP_TEXT.length)];
  return sample;
}

const Loader: FunctionComponent<LoaderProps> = (props: LoaderProps) => {
  const [text, setText] = useState(randText());
  useEffect(() => { setInterval(() => setText(randText()), 2000) }, [])
  return (<div className='loadingIndicator'>
    <span className="loading-text">{text}</span>
    <RingLoader color="#2C2A2B" size={75} />
  </div>);
}

export default Loader;