import { useRef, useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Vex from 'vexflow';
import './App.css'

// Calculates the measure number of measure y on stave x
function calculateCurrentMeasureNumber(x: number, y:number, sheet: Vex.TabNote[][][]) {
  let count = 0; 
  for (let i = 0; i < x; i++) {
    count += sheet[i].length;
  }

  return count + y + 1; // add 1 because our y is 0 indexed
}

function App() {
  const { Renderer, TabStave, TabNote, Formatter } = Vex.Flow;
  const [sheet, setSheet] = useState<Vex.TabNote[][][]>([[[]]]) // stores the notes for each measure
  const [staves, setStaves] = useState<Vex.Stave[][]>([[new TabStave(10, 50, 400)]]) // stores the object for each measure
  const [stave_number, setStaveNumber] = useState<number>(0) // may be NaN because inputted text may not be a number
  const [measure_number, setMeasureNumber] = useState<number>(0)
  const firstString = useRef<string>("-")
  const secondString = useRef<string>("-")
  const thirdString = useRef<string>("-")
  const fourthString = useRef<string>("-")
  const fifthString = useRef<string>("-")
  const sixString = useRef<string>("-")

  useEffect(() => {
          const div = document.getElementById('output') as HTMLDivElement;
          div.innerHTML = "";
          const renderer = new Renderer(div, Renderer.Backends.SVG);
          // Configure the rendering context. arg1 = width, arg2 = height
          renderer.resize(window.innerWidth, window.outerHeight * 2);
          const context = renderer.getContext();
          
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
          
      }, )
  
  function addNote(e: React.FormEvent, prevSheet: Vex.TabNote[][][]) {
    e.preventDefault()
    const newGrid = prevSheet.map((rowArray) => [...rowArray]);

    const newNotes = [firstString.current, secondString.current, thirdString.current, fourthString.current, fifthString.current, sixString.current]
    // if (!newNotes.every(str => str === '-')) {
    //   newGrid.push(newNotes)
      
    const notes: Vex.TabNote[] = [];
    

    const pos = []
    for (let i = 0; i < 6; i++) {
        const col = newNotes[i]
        if (col !== '-') {
            // string positions are 1-indexed so we add 1
            pos.push({str: i + 1, fret: col})
        }
    }

    if (pos.length !== 0) { 
      notes.push(new TabNote({
          positions: pos,
          duration: "q",
      }))
  }
    
    newGrid[stave_number][measure_number]= newGrid[stave_number][measure_number].concat(notes)

    setSheet(newGrid)
    
  }

  function deleteNote(e: React.MouseEvent<HTMLButtonElement>, prevSheet: Vex.TabNote[][][]) {
    e.preventDefault()
    if (prevSheet[stave_number][measure_number].length > 0) {
      const newGrid = prevSheet.map((rowArray) => [...rowArray]);
      newGrid[stave_number][measure_number].pop()
      setSheet(newGrid)
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
      setMeasureNumber(0);
    } else if (stave_number - 1 >= 0) {
        setStaveNumber(stave_number - 1);
        setMeasureNumber(0);
      }
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

  return (
    <>
    <Box padding={1}>
      <form onSubmit={(e: React.FormEvent) => addNote(e, sheet)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5}}>
        <TextField id="first-string" label="First-String" variant="standard" defaultValue={""} onChange={(e) => firstString.current = (e.target.value)}/> 
        <TextField id="second-string" label="Second-String" variant="standard" defaultValue={""} onChange={(e) => secondString.current = (e.target.value)}/>
        <TextField id="third-string" label="Third-String" variant="standard" defaultValue={""} onChange={(e) => thirdString.current = (e.target.value)}/>
        <TextField id="fourth-string" label="Fourth-String" variant="standard" defaultValue={""} onChange={(e) => fourthString.current = (e.target.value)}/>
        <TextField id="Fifth-string" label="Fifth-String" variant="standard"  defaultValue={""} onChange={(e) => fifthString.current = (e.target.value)}/>
        <TextField id="Six-string" label="Six-String" variant="standard"  defaultValue={""} onChange={(e) => sixString.current = (e.target.value)}/>
        <Button type="submit" variant="contained" style={{margin: 10}}> Add</Button>
        <Button variant="contained" onClick={(e) => deleteNote(e, sheet)} style={{margin: 10}}> Delete</Button>
      </form>

        <Box style={{display: 'flex', justifyContent: 'center'}}>
          <Button variant="contained" onClick={() => changeStaveNumber(-1)}> - </Button>
          Stave: {stave_number + 1} 
          <Button variant="contained" onClick={() => changeStaveNumber(1)}> + </Button> 
        </Box>
        <Box style={{display: 'flex', justifyContent: 'center'}}>
          <Button variant="contained" onClick={() => changeMeasureNumber(-1)}> - </Button>
          Measure: {measure_number + 1}
          <Button variant="contained" onClick={() => changeMeasureNumber(1)}> + </Button> 

      </Box>
      {/* <Sheet {...sheet} /> */}
      <div id="output" />
    </Box>
    </>
  )
}

export default App
