import { useEffect } from 'react';
import Vex from 'vexflow';

function Sheet(userNotes: string[][]) {
    const { Renderer, TabStave, TabNote, Formatter } = Vex.Flow;

    useEffect(() => {
        const div = document.getElementById('output') as HTMLDivElement;
        div.innerHTML = "";
        const renderer = new Renderer(div, Renderer.Backends.SVG);
        // Configure the rendering context. arg1 = width, arg2 = height
        renderer.resize(window.outerWidth, window.outerHeight * 2);
        const context = renderer.getContext();
        
        // Create a tab stave of width 400 at position 10, 40 on the canvas.
        const stave = new TabStave(10, 50, 400);
        stave.addClef('tab').setContext(context).draw();
        
        const notes: Vex.TabNote[] = [];
        

        for (let j = 0; j < Object.keys(userNotes).length; j++) {
            const pos = []
            const col = userNotes[j]
            for (let i = 0; i < 6; i++){
                if (col[i] !== '-') {
                    // string positions are 1-indexed so we add 1
                    pos.push({str: i + 1, fret: col[i]})
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