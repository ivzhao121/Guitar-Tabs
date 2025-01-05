import { useRef, useState, useEffect } from 'react'; 
import html2canvas from 'html2canvas';
import { Box, Button, IconButton, Stack } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import Vex from 'vexflow';
import './App.css'
import Typography from '@mui/material/Typography';
import StringInput from './components/StringInput';
import Sheet from './components/Sheet';

interface Modifier {
  index: number, 
  modifier: string,
}

/*
Represents the most recent note added to the sheet
note: the note added
indices: the positions that have modifiers 
modifiers: the modifiers on the positions 
*/
interface PushedNote {
  note: Vex.TabNote, 
  modifiers: Modifier[],
}

interface NoteTie {
  firstNote: Vex.TabNote,
  secondNote: Vex.TabNote,
  modifiers: Modifier[],
}


// Calculates the measure number of measure y on stave x
function calculateCurrentMeasureNumber(x: number, y:number, sheet: Vex.TabNote[][][]) {
  let count = 0; 
  for (let i = 0; i < x; i++) {
    count += sheet[i].length;
  }

  return count + y + 1; // add 1 because our y is 0 indexed
}

function App() {
  const { Renderer, TabStave, TabNote, TabTie, TabSlide, Formatter } = Vex.Flow;
  const [sheet, setSheet] = useState<Vex.TabNote[][][]>([[[]]]) // stores the notes for each measure
  const [staves, setStaves] = useState<Vex.Stave[][]>([[new TabStave(10, 50, 400)]]) // stores the object for each measure
  const tieStack = useRef<NoteTie[]>([]);
  const tiePair = useRef<PushedNote[]>([]);
  const [stave_number, setStaveNumber] = useState<number>(0) 
  const [measure_number, setMeasureNumber] = useState<number>(0)
  const strings = useRef<string[]>(["-","-","-","-","-","-"])
  const stringTies = useRef<string[]>(["none", "none", "none", "none", "none", "none"])
  const exportDiv = useRef(null);

  useEffect(() => {
          const div = document.getElementById('output') as HTMLDivElement;
          div.innerHTML = "";
          const renderer = new Renderer(div, Renderer.Backends.SVG);
          renderer.resize(window.innerWidth, window.outerHeight * 2); 
          const context = renderer.getContext();
          
          renderer.getContext().fillText("test", 0, 0);

          for (let i = 0; i < sheet.length; i++) {
            for (let j = 0; j < sheet[i].length; j++) {
              const measure = staves[i][j];
              if (measure.getClef() !== 'tab' && j === 0) {
                measure.addClef('tab');
              } 
              const measure_num = calculateCurrentMeasureNumber(i,j,sheet);
              measure.setMeasure(measure_num).setContext(context).draw();
              const notes = sheet[i][j]; 
              if (notes.length !== 0) {
                Formatter.FormatAndDraw(context, measure, notes);
            }
            }
          }

          tieStack.current.forEach((tie : NoteTie) => {
            tie.modifiers.forEach((m: Modifier) => {
              if (m.modifier === "hammer") {
                const hammer = { first_note: tie.firstNote, last_note: tie.secondNote, first_indices: [m.index], last_indices: [m.index] }
                TabTie.createHammeron(hammer).setContext(context).draw();
              } else if (m.modifier === "pull off"){
                const pullOff = { first_note: tie.firstNote, last_note: tie.secondNote, first_indices: [m.index], last_indices: [m.index] }
                TabTie.createPulloff(pullOff).setContext(context).draw();
              } else if (m.modifier === "slide up"){
                const slideUp = { first_note: tie.firstNote, last_note: tie.secondNote, first_indices: [m.index], last_indices: [m.index] }
                TabSlide.createSlideUp(slideUp).setContext(context).draw();
              } else if (m.modifier === "slide down"){
                const slideDown = { first_note: tie.firstNote, last_note: tie.secondNote, first_indices: [m.index], last_indices: [m.index] }
                TabSlide.createSlideDown(slideDown).setContext(context).draw();
              }
            });
          });
          
      }, )

  function addNote(e: React.FormEvent, prevSheet: Vex.TabNote[][][]) {
    e.preventDefault()
    const newGrid = prevSheet.map((rowArray) => [...rowArray]);

    const pos = [];
    const modifiers = [];
    for (let i = 0; i < 6; i++) {
        if (strings.current[i] !== '-') {
            pos.push({str: i + 1, fret: strings.current[i]}); // string positions are 1-indexed so we add 1
            if (stringTies.current[i] !== 'none') {
              modifiers.push({index: pos.length - 1, modifier: stringTies.current[i]});
            }
        }
    }

    if (pos.length !== 0) { 
      const newChord = new TabNote({positions: pos, duration: "q",});
      newGrid[stave_number][measure_number].push(newChord);
      if (modifiers.length !== 0) {
        tiePair.current.push({note: newChord, modifiers: modifiers});
        if (tiePair.current.length == 2) {
          const overlapModifiers = [];
          for (let i = 0; i < tiePair.current[0].modifiers.length; i++) {
            for (let j = 0; j < tiePair.current[1].modifiers.length; j++) {
              if (tiePair.current[0].modifiers[i].index === tiePair.current[1].modifiers[j].index && tiePair.current[0].modifiers[i].modifier === tiePair.current[1].modifiers[j].modifier) {
                overlapModifiers.push(tiePair.current[0].modifiers[i]);
              }
            }
          }
          const newTie = {firstNote: tiePair.current[0].note,
            secondNote: tiePair.current[1].note,
            modifiers: overlapModifiers};
          tieStack.current.push(newTie);
          tiePair.current.shift();
        }
      } else {
        tiePair.current = [];
      }

      setSheet(newGrid);
    }
  }

  function deleteNote(e: React.MouseEvent<HTMLButtonElement>, prevSheet: Vex.TabNote[][][]) {
    e.preventDefault();
    if (prevSheet[stave_number][measure_number].length > 0) {
      const newGrid = prevSheet.map((rowArray) => [...rowArray]);
      const removedNote = newGrid[stave_number][measure_number].pop();
      for (let i = 0; i < tieStack.current.length; i++) {
        if (tieStack.current[i].firstNote === removedNote || tieStack.current[i].secondNote === removedNote) {
          tieStack.current.splice(i, 1);
        }
      }
      tiePair.current = [];

      setSheet(newGrid);
    }
  }

  function changeStaveNumber(difference: number) {
    if (difference === 1) {
      if (sheet[stave_number + 1] === undefined) {
        const newSheet = sheet.map((rowArray) => [...rowArray]);
        const newStaves = staves.map((rowArray) => [...rowArray]);

        newSheet[stave_number + 1] = [[]]
        newStaves[stave_number + 1] = []
        newStaves[stave_number + 1][0] = new TabStave(newStaves[stave_number][0].getX(), 
                                                                    newStaves[stave_number][0].getHeight() + newStaves[stave_number][0].getY() + 20,  
                                                                    400);
        setSheet(newSheet);
        setStaves(newStaves);
      }

      setStaveNumber(stave_number + 1);
    } else if (stave_number - 1 >= 0) {
        setStaveNumber(stave_number - 1);
      }
      tiePair.current = [];
      setMeasureNumber(0);
  }

  function changeMeasureNumber(difference: number) {
    if (difference === 1) {
      if (sheet[stave_number][measure_number + 1] === undefined) {
        const newSheet = sheet.map((rowArray) => [...rowArray]);
        const newStaves = staves.map((rowArray) => [...rowArray]);

        newSheet[stave_number][measure_number + 1] = []
        newStaves[stave_number][measure_number + 1] = new TabStave(newStaves[stave_number][measure_number].getWidth() + newStaves[stave_number][measure_number].getX(), 
                                                                    newStaves[stave_number][measure_number].getY(),  
                                                                    400);
        setSheet(newSheet);
        setStaves(newStaves);
      }
      setMeasureNumber(measure_number + 1);
    } else if (measure_number - 1 >= 0) {
        setMeasureNumber(measure_number - 1);
    }
  }

  const handleSaveAsImage = async () => {
    if (exportDiv.current) {
      const canvas = await html2canvas(exportDiv.current);
      const dataURL = canvas.toDataURL('image/png');

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'my-div.png';
      link.click();
    }
  };

  return (
    <>
    <Box padding={1}>
      <form onSubmit={(e: React.FormEvent) => addNote(e, sheet)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5}}>
        <StringInput inputLabel="First-String" onFretChange={(fret) => strings.current[0] = fret} onTieChange={(tie) => stringTies.current[0] = tie}/>
        <StringInput inputLabel="Second-String" onFretChange={(fret) => strings.current[1] = fret} onTieChange={(tie) => stringTies.current[1] = tie}/>
        <StringInput inputLabel="Thrid-String" onFretChange={(fret) => strings.current[2] = fret} onTieChange={(tie) => stringTies.current[2] = tie}/>
        <StringInput inputLabel="Fourth-String" onFretChange={(fret) => strings.current[3] = fret} onTieChange={(tie) => stringTies.current[3] = tie}/>
        <StringInput inputLabel="Fifth-String" onFretChange={(fret) => strings.current[4] = fret} onTieChange={(tie) => stringTies.current[4] = tie}/>
        <StringInput inputLabel="Sixth-String" onFretChange={(fret) => strings.current[5] = fret} onTieChange={(tie) => stringTies.current[5] = tie}/>
        <Button type="submit" variant="contained" style={{margin: 10}}> Add</Button>
        <Button variant="contained" onClick={(e) => deleteNote(e, sheet)} > Delete</Button>
      </form>
      <Stack alignItems="center" direction="column">
        <Stack alignItems="center" direction="row" gap={2}>
          <IconButton onClick={() => changeStaveNumber(-1)}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography >
            Stave: {stave_number + 1} 
          </Typography>
          <IconButton onClick={() => changeStaveNumber(1)}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>
        <Stack alignItems="center" direction="row" gap={2}>
          <IconButton onClick={() => changeMeasureNumber(-1)}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography>
          Measure: {measure_number + 1}
          </Typography>
          <IconButton onClick={() => changeMeasureNumber(1)}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>
        <Button onClick={handleSaveAsImage} > Save as Image </Button>
    </Stack>
    <div ref={exportDiv}>
      <Box style={{margin: "auto", textAlign: "center", marginTop: 50}}>
        <input style={{fontSize: 50, border: 0, textAlign: "center"}} placeholder="Title" />
      </Box>
      <div id="output" />
    </div>
    </Box>
    </>
  )
}

export default App
