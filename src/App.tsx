import { useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Sheet from './components/Sheet';
import './App.css'


function App() {
  const [sheet, setSheet] = useState<string[][]>([])
  const [firstString, setFirstString] = useState<string>("-")
  const [secondString, setSecondString] = useState<string>("-")
  const [thirdString, setThirdString] = useState<string>("-")
  const [fourthString, setFourthString] = useState<string>("-")
  const [fifthString, setFifthString] = useState<string>("-")
  const [sixString, setSixString] = useState<string>("-")


  function addNote(e: React.FormEvent, prevSheet: string[][]) {
    e.preventDefault()
    let newGrid = prevSheet.map((rowArray) => [...rowArray]);

    let newNotes = [firstString, secondString, thirdString, fourthString, fifthString, sixString]
    if (!newNotes.every(str => str === '-')) {
      newGrid.push(newNotes)
      
      setFirstString("-")
      setSecondString("-")
      setThirdString("-")
      setFourthString("-")
      setFifthString("-")
      setSixString("-")
  
      setSheet(newGrid)
    }
  }

  function deleteNote(e: React.MouseEvent<HTMLButtonElement>, prevSheet: string[][]) {
    e.preventDefault()
    if (prevSheet.length > 0) {
      let newGrid = prevSheet.map((rowArray) => [...rowArray]);
      newGrid.pop()
  
      setSheet(newGrid)
    }
  }

  return (
    <>
    <Box padding={1}>
      <form onSubmit={(e: React.FormEvent) => addNote(e, sheet)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 5}}>
        <TextField id="first-string" label="First-String" variant="standard" value={firstString} onChange={(e) => setFirstString(e.target.value)}/>
        <TextField id="second-string" label="Second-String" variant="standard" value={secondString} onChange={(e) => setSecondString(e.target.value)}/>
        <TextField id="third-string" label="Third-String" variant="standard" value={thirdString} onChange={(e) => setThirdString(e.target.value)}/>
        <TextField id="fourth-string" label="Fourth-String" variant="standard" value={fourthString} onChange={(e) => setFourthString(e.target.value)}/>
        <TextField id="Fifth-string" label="Fifth-String" variant="standard"  value={fifthString} onChange={(e) => setFifthString(e.target.value)}/>
        <TextField id="Six-string" label="Six-String" variant="standard"  value={sixString} onChange={(e) => setSixString(e.target.value)}/>
        <Button type="submit" variant="contained" style={{margin: 10}}> Add</Button>
        <Button variant="contained" onClick={(e) => deleteNote(e, sheet)} style={{margin: 10}}> Delete</Button>
      </form>
      <Sheet {...sheet} />
    </Box>
    </>
  )
}

export default App
