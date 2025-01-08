import { useRef, useState, useEffect } from 'react'; 
import html2canvas from 'html2canvas';
import { Box, Button, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Vex from 'vexflow';
import './App.css'
import Typography from '@mui/material/Typography';
import StringInput from './components/StringInput';

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
  const stave_width = (window.outerWidth - 48 - 10) / 3;
  const [sheet, setSheet] = useState<Vex.TabNote[][][]>([[[]]]) // stores the notes for each measure
  const [staves, setStaves] = useState<Vex.Stave[][]>([[new TabStave(10, 0, stave_width)]]) // stores the object for each measure
  const tieStack = useRef<NoteTie[]>([]);
  const tiePair = useRef<PushedNote[]>([]);
  const [stave_number, setStaveNumber] = useState<number>(0) 
  const [measure_number, setMeasureNumber] = useState<number>(0)
  const strings = useRef<string[]>(["","","","","",""])
  const stringTies = useRef<string[]>(["none", "none", "none", "none", "none", "none"])
  const exportDiv = useRef(null);

  useEffect(() => {
          let canvas_height = 100;
          for (let i = 0; i < staves.length; i++) {
            canvas_height += staves[i][0].getHeight() + 20;
          }
          const div = document.getElementById('output') as HTMLDivElement;
          div.innerHTML = "";
          const renderer = new Renderer(div, Renderer.Backends.SVG);
          renderer.resize(window.outerWidth - 32, canvas_height); 
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
        if (strings.current[i] !== '') {
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
      
      const newTieStack = [];
      for (let i = 0; i < tieStack.current.length; i++) {
        if (tieStack.current[i].firstNote !== removedNote && tieStack.current[i].secondNote !== removedNote) {
          newTieStack.push(tieStack.current[i]);
        }
      }
      tieStack.current = newTieStack;
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
                                                                    stave_width);
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
                                                                    stave_width);
        setSheet(newSheet);
        setStaves(newStaves);
      }
      setMeasureNumber(measure_number + 1);
    } else if (measure_number - 1 >= 0) {
        setMeasureNumber(measure_number - 1);
    }
  }

  function deleteCurrentMeasure() {
    if (measure_number === 0 && stave_number === 0 && sheet.length === 1 && sheet[0].length === 1) {
      setSheet([[[]]]);
      setStaves([[new TabStave(10, 50, stave_width)]]);
      tiePair.current = [];
      tieStack.current = [];
    } else {
      const newSheet = sheet.map((rowArray) => [...rowArray]);
      const newStaves = staves.map((rowArray) => [...rowArray]);
      const width = staves[stave_number][measure_number].getWidth(); 
      const removedNotes = newSheet[stave_number].splice(measure_number, 1)[0]; 
      if (newSheet[stave_number].length === 0) {
        for (let i = stave_number + 1; i < newStaves.length; i++) {
          for (let j = 0; j < newStaves[i].length; j++) {
            newStaves[i][j].setY(newStaves[i][j].getY() - newStaves[i][j].getHeight() - 20);
          }
        }
        newSheet.splice(stave_number, 1);
        newStaves.splice(stave_number, 1);
      } else {
        newStaves[stave_number].splice(measure_number, 1)
        for (let i = measure_number; i < newStaves[stave_number].length; i++) {
          newStaves[stave_number][i].setX(newStaves[stave_number][i].getX() - width);
        }
      }

      const newTieStack = [] as NoteTie[];
      for (let i = 0; i < tieStack.current.length; i++) {
        if (removedNotes.map((note: Vex.TabNote) => tieStack.current[i].firstNote !== note && tieStack.current[i].secondNote !== note).every(Boolean)) {
          newTieStack.push(tieStack.current[i]);
        }
      }

      if (newTieStack.length !== 0)  {
        console.log("yes");
        tieStack.current = newTieStack;
        console.log(tieStack.current.length);
      }

      tiePair.current = [];
      setMeasureNumber(0);
      setStaveNumber(0);
      setSheet(newSheet);
      setStaves(newStaves);
    }

  }

  const handleSaveAsImage = async () => {
    if (exportDiv.current) {
      const canvas = await html2canvas(exportDiv.current, {
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
    });
      const dataURL = canvas.toDataURL('my_tabs/png');

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'my_tabs.png';
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
        <Button onClick={handleSaveAsImage} style = {{margin: 10}} > Save as Image </Button>

      </form>
      <Stack alignItems="center" direction="column" style={{marginBottom: 25}}>
        <Stack alignItems="center" direction="row" gap={2}>
          <IconButton onClick={() => changeStaveNumber(-1)}>
            <RemoveIcon />
          </IconButton>
          <Typography >
            Stave: {stave_number + 1} 
          </Typography>
          <IconButton onClick={() => changeStaveNumber(1)}>
            <AddIcon />
          </IconButton>
        </Stack>
        <Stack alignItems="center" direction="row" gap={2}>
          <IconButton onClick={() => changeMeasureNumber(-1)}>
            <RemoveIcon />
          </IconButton>
          <Typography>
          Measure: {measure_number + 1}
          </Typography>
          <IconButton onClick={() => changeMeasureNumber(1)}>
            <AddIcon />
          </IconButton>
        </Stack>
        <Button variant="contained" onClick={deleteCurrentMeasure} style={{backgroundColor: "red"}} > Delete Measure </Button>
      </Stack>      
      <hr /> 
      <div ref={exportDiv} style={{marginTop: 25}}>
        <Box style={{textAlign: "center"}}>
          <input style={{fontSize: 20, border: 0, textAlign: "center", marginTop: 25}} placeholder="Title" />
        </Box>
        <div id="output" />
      </div>
      </Box>
    </>
  )
}

export default App
