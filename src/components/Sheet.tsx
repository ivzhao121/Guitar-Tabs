import { useEffect } from 'react';
import Vex from 'vexflow';

function Sheet(userNotes: string[][]) {
    const { Renderer, TabStave, TabNote, Formatter } = Vex.Flow;

    useEffect(() => {
        const div = document.getElementById('output') as HTMLDivElement;
        div.innerHTML = "";
        const renderer = new Renderer(div, Renderer.Backends.SVG);
        // Configure the rendering context.
        renderer.resize(window.innerWidth, 300);
        const context = renderer.getContext();
        
        // Create a tab stave of width 400 at position 10, 40 on the canvas.
        const stave = new TabStave(10, 40, window.innerWidth * .9);
        stave.addClef('tab').setContext(context).draw();
        
        const notes: Vex.TabNote[] = [];
        

        for (let j = 0; j < Object.keys(userNotes).length; j++) {
            const pos = []
            const col = userNotes[j]
            for (let i = 0; i < 6; i++){
                if (col[i] !== '-') {
                    pos.push({str: i, fret: parseInt(col[i], 10)})
                }
            }
            if (pos.length !== 0) { 
                notes.push(new TabNote({
                    positions: pos,
                    duration: "q",
                }))
            }
        }
        
        if (notes.length !== 0) {
            Formatter.FormatAndDraw(context, stave, notes);
        }
    }, [userNotes])
    
    
    return(
        <div id="output" />
    )
}

export default Sheet