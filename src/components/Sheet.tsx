import { useEffect } from 'react';
import Vex from 'vexflow';

function Sheet() {
    const { Renderer, TabStave, TabNote, TabTie, TabSlide, Bend, Vibrato, Formatter, Stroke } = Vex.Flow;

    useEffect(() => {

        // Create an SVG renderer and attach it to the DIV element with id="output".
        const div = document.getElementById("output") as HTMLDivElement;
        const renderer = new Renderer(div, Renderer.Backends.SVG);
        
        // Configure the rendering context.
        renderer.resize(600, 300);
        const context = renderer.getContext();
        
        // Create a tab stave of width 400 at position 20, 40 on the canvas.
        const stave = new TabStave(20, 40, 300);
        stave.addClef("tab").setContext(context).draw();

        // const stave2 = new TabStave(320, 40, 300);
        const stave2 = new TabStave(20, 150, 300);
        stave2.setContext(context).draw();
        
        const notes = [
            // A single note
            new TabNote({
                positions: [{ str: 3, fret: 7 }],
                duration: "q",
            }),
        
            // A chord with the note on the 3rd string bent
            new TabNote({
                positions: [
                    { str: 2, fret: 10 },
                    { str: 3, fret: 9 },
                ],
                duration: "q",
            }).addModifier(new Bend("Full"), 1),
        
            // A single note with a harsh vibrato
            new TabNote({
                positions: [{ str: 1, fret: 4 }, { str: 2, fret: 5 }],
                duration: "q",
            }).addModifier(new Vibrato().setHarsh(true).setVibratoWidth(70), 0).addModifier(new Stroke(7)),

            new TabNote({
                positions: [{ str: 2, fret: 5 }, { str: 3, fret: 5 }],
                duration: "q",
            }),

            new TabNote({
                positions: [{ str: 2, fret: 6 }],
                duration: "q",
            }),

            new TabNote({
                positions: [{ str: 2, fret: 7 }],
                duration: "q",
            }),
        ];

        // first_note, last_note let's us specify which notes we want to connect
        // first_indices, and last_idices represent which position in the notes we connect (e.g index 0 of note 1 slide to index 0 of note 2)
        const tie = { first_note: notes[3], last_note: notes[5], first_indices: [0], last_indices: [0] }
        const ts = new TabTie(tie);

        Formatter.FormatAndDraw(context, stave, notes);
        
        ts.setContext(context).draw();
        TabTie.createHammeron(tie).setContext(context).draw();

        const notes2 = [
            // A single note
            new TabNote({
                positions: [{ str: 2, fret: 8 }],
                duration: "q",
            }),
            new TabNote({
                positions: [{ str: 2, fret: 9 }],
                duration: "q",
            })
        ]
        Formatter.FormatAndDraw(context, stave2, notes2);

        const tie2 = { first_note: notes2[0], last_note: notes2[1], first_indices: [0], last_indices: [0] }
        TabSlide.createSlideDown(tie2).setContext(context).draw();

        const tie3 = { first_note: notes[5], last_note: null, first_indices: [0], last_indices: [0] }
        TabTie.createHammeron(tie3).setContext(context).draw();

        const tie4 = { first_note: null, last_note: notes2[0], first_indices: [0], last_indices: [0] }
        const tabtie4 = new TabTie(tie4);
        tabtie4.setContext(context).draw()


    })
    
    
    return(
        <div id="output" />
    )
}

export default Sheet