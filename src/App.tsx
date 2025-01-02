import { useRef, useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Sheet from './components/Sheet';
import Vex from 'vexflow';
import './App.css'


function App() {
 //  const { Renderer, TabStave, TabNote, Formatter } = Vex.Flow;
  const [sheet, setSheet] = useState<string[][]>([])
  const stave = useRef<number>(0) // may be NaN because inputted text may not be a number
  const measure = useRef<number>(0)
  const firstString = useRef<string>("-")
  const secondString = useRef<string>("-")
  const thirdString = useRef<string>("-")
  const fourthString = useRef<string>("-")
  const fifthString = useRef<string>("-")
  const sixString = useRef<string>("-")


  function addNote(e: React.FormEvent, prevSheet: string[][]) {
    e.preventDefault()
    const newGrid = prevSheet.map((rowArray) => [...rowArray]);

    const newNotes = [firstString.current, secondString.current, thirdString.current, fourthString.current, fifthString.current, sixString.current]
    if (!newNotes.every(str => str === '-')) {
      newGrid.push(newNotes)
      

      setSheet(newGrid)
    }
  }

  function deleteNote(e: React.MouseEvent<HTMLButtonElement>, prevSheet: string[][]) {
    e.preventDefault()
    if (prevSheet.length > 0) {
      const newGrid = prevSheet.map((rowArray) => [...rowArray]);
      newGrid.pop()
  
      setSheet(newGrid)
    }
  }

  return (
    <>
    <Box padding={1}>
      <form onSubmit={(e: React.FormEvent) => addNote(e, sheet)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5}}>
        <TextField id="stave" label="stave" variant="standard" defaultValue={"0"} onChange={(e) => stave.current = (parseInt(e.target.value, 10))}/>
        <TextField id="measure" label="measure" variant="standard" defaultValue={"0"} onChange={(e) => measure.current = (parseInt(e.target.value, 10))} style={{marginRight: 100}}/>
        <TextField id="first-string" label="First-String" variant="standard" defaultValue={""} onChange={(e) => firstString.current = (e.target.value)}/> 
        <TextField id="second-string" label="Second-String" variant="standard" defaultValue={""} onChange={(e) => secondString.current = (e.target.value)}/>
        <TextField id="third-string" label="Third-String" variant="standard" defaultValue={""} onChange={(e) => thirdString.current = (e.target.value)}/>
        <TextField id="fourth-string" label="Fourth-String" variant="standard" defaultValue={""} onChange={(e) => fourthString.current = (e.target.value)}/>
        <TextField id="Fifth-string" label="Fifth-String" variant="standard"  defaultValue={""} onChange={(e) => fifthString.current = (e.target.value)}/>
        <TextField id="Six-string" label="Six-String" variant="standard"  defaultValue={""} onChange={(e) => sixString.current = (e.target.value)}/>
        <Button type="submit" variant="contained" style={{margin: 10}}> Add</Button>
        <Button variant="contained" onClick={(e) => deleteNote(e, sheet)} style={{margin: 10}}> Delete</Button>
      </form>
      <Sheet {...sheet} />
    </Box>
    </>
  )
}

export default App
