import {Box, TextField} from '@mui/material';

interface FretInputProps {
    inputLabel: string;
    onFretChange: (value: string) => void;
    onTieChange: (value: string) => void;
  }

const StringInput: React.FC<FretInputProps> = ({ inputLabel, onFretChange, onTieChange }) => {
    return (
        <Box style={{display: 'grid'}}>
          <TextField label={inputLabel} variant="standard" defaultValue={""} onChange={(e) =>  onFretChange(e.target.value)}/> 
          <select name="cars" id="cars" onChange={(e) =>  onTieChange(e.target.value)} > 
            <option value="none">Add Modifier</option> 
            <option value="none">none</option>
            <option value="hammer">hammer</option>
            <option value="pull off">pull off</option>
            <option value="slide up">slide up</option>
            <option value="slide down">slide down</option>
          </select>
        </Box>
    );
}

export default StringInput;