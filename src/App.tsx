import { useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './App.css'

function App() {
  const [sheet, setSheet] = useState<String[][]>([["E |", "A |", "D |","G |","B |","E |"]])
  const [firstString, setFirstString] = useState<String>("-")
  const [secondString, setSecondString] = useState<String>("-")
  const [thirdString, setThirdString] = useState<String>("-")
  const [fourthString, setFourthString] = useState<String>("-")
  const [fifthString, setFifthString] = useState<String>("-")
  const [sixString, setSixString] = useState<String>("-")


  function addNote(e: React.FormEvent, prevSheet: String[][]) {
    e.preventDefault()
    let newGrid = prevSheet.map((rowArray) => [...rowArray]);

    let newNotes = [firstString, secondString, thirdString, fourthString, fifthString, sixString]
    let maxLength = Math.max(...newNotes.map(str => str.length))
    newNotes = newNotes.map(str => str.padEnd(maxLength, '-'))

    newGrid.push(newNotes)
    newGrid.push(["-", "-", "-", "-", "-", "-"])
    
    setFirstString("-")
    setSecondString("-")
    setThirdString("-")
    setFourthString("-")
    setFifthString("-")
    setSixString("-")

    setSheet(newGrid)
  }

  function deleteNote(e: React.MouseEvent<HTMLButtonElement>, prevSheet: String[][]) {
    e.preventDefault()
    if (prevSheet.length > 1) {
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


      {sheet.length != 0 && <Box display={'flex'} padding={2} flexWrap={"wrap"}> 
        {sheet.map( (row, rowIndex) => 
        <Box key={rowIndex} paddingLeft={.5}>
        {row.map((note, colIndex) => 
          <p className = 'sheet' key={rowIndex + colIndex} >
            {note === "" ? "-" : note}
          </p>
          )}
        </ Box>
        )}
        </Box>}
    </Box>
    </>
  )
}

export default App
