//  DATI 

let ramTotale = 1024;
let memoriaRAM = [];  
let codaProcessi = []; 
let contatore = 0;

let coloriProcessi = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];

function setup() {
    let canvas = createCanvas(650, 400);
    canvas.parent('canvas');
    inizializzaRAM();
}

function draw() {

    background(230);
    
    disegnaRAM();
    disegnaCodaProcessi();
    disegnaLegenda();
}


// DISEGNO

function disegnaRAM() {

    stroke(0);
    strokeWeight(2);
    noFill();
    rect(40, 40, 130, 300);
    
    // disegno ogni blocco
    for (let i = 0; i < memoriaRAM.length; i++) {
        let blocco = memoriaRAM[i];
        let posY = 40 + (blocco.inizio / ramTotale) * 300;
        let altezza = (blocco.dimensione / ramTotale) * 300;
        if (blocco.nome == "SO") {
            fill(150, 100, 200);
        } else if (blocco.libero) {
            fill(100, 200, 100);
        } else {
            fill(blocco.colore);
        }
        
        strokeWeight(1);
        rect(40, posY, 130, altezza);
        
        // testo dentro il blocco
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        let centerY = posY + altezza / 2;
        if (altezza > 15) {
            textSize(10);
            text(blocco.dimensione + " KB", 105, centerY);
        }
        stroke(0);
    }

}

function disegnaCodaProcessi() {
    fill(0);
    textSize(16);
    textAlign(LEFT);
    text("CODA PROCESSI", 220, 25);
    textSize(11);
    text("(clicca per allocare)", 220, 42);
    
    if (codaProcessi.length == 0) {
        textSize(12);
        fill(100);
        text("Nessun processo in coda", 220, 80);
        return;
    }
    
    let posX = 220, posY = 60;
    for (let i = 0; i < codaProcessi.length; i++) {
        let p = codaProcessi[i];
        fill(p.colore);
        stroke(0);
        strokeWeight(1);
        rect(posX, posY, 80, 50, 5);
        
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text(p.nome, posX + 40, posY + 18);
        textSize(11);
        text(p.dimensione + " KB", posX + 40, posY + 36);
        
        posX += 90;
        if (posX > 520) { posX = 220; posY += 60; }
    }
}

function disegnaLegenda() {
    let posX = 220, posY = 320;
    textSize(12);
    textAlign(LEFT);
    fill(0);
    text("Legenda:", posX, posY);
    
    const legenda = [
        { colore: [150, 100, 200], testo: "Sistema Operativo", x: 0 },
        { colore: [100, 200, 100], testo: "Libero", x: 150 },
        { colore: [255, 100, 100], testo: "Occupato", x: 250 }
    ];
    
    legenda.forEach(item => {
        fill(...item.colore);
        rect(posX + item.x, posY + 10, 20, 15);
        fill(0);
        text(item.testo, posX + item.x + 25, posY + 22);
    });
}


//  GESTIONE MEMORIA

function inizializzaRAM() {
    ramTotale = int(document.getElementById('inputRam').value);
    memoriaRAM = [];
    codaProcessi = [];
    contatore = 0;
    
    // sistema operativo 
    memoriaRAM.push({
        inizio: 0,
        dimensione: 100,
        libero: false,
        nome: "SO",
        colore: null
    });
    
    //  memoria libera
    memoriaRAM.push({
        inizio: 100,
        dimensione: ramTotale - 100,
        libero: true,
        nome: null,
        colore: null
    });
    
    calcolaStatistiche();
}

function aggiungiProcesso() {
    let nome = document.getElementById('inputNome').value;
    let dimensione = int(document.getElementById('inputDim').value);
    
    // fa se processo senza nome
    if (nome == "") {
        nome = "P" + contatore;
    }
    
    if (dimensione <= 0) {
        alert("Dimensione non valida!");
        return;
    }
    
    codaProcessi.push({
        nome: nome,
        dimensione: dimensione,
        colore: coloriProcessi[contatore % 6]
    });
    
    contatore++;
    document.getElementById('inputNome').value = "";
}

// allocazione 
function allocaProcesso(indice) {
    let processo = codaProcessi[indice];
    let algoritmo = document.getElementById('selectAlgo').value;
    let blocchiLiberi = memoriaRAM.filter(b => b.libero && b.dimensione >= processo.dimensione);
    
    if (blocchiLiberi.length === 0) {
        alert("Memoria insufficiente per " + processo.nome);
        return;
    }
    
    let blocco = algoritmo === "first" ? blocchiLiberi[0] :
                 algoritmo === "best" ? blocchiLiberi.reduce((min, b) => b.dimensione < min.dimensione ? b : min) :
                 blocchiLiberi.reduce((max, b) => b.dimensione > max.dimensione ? b : max);
    
    let bloccoTrovato = memoriaRAM.indexOf(blocco);
    let spazioRestante = blocco.dimensione - processo.dimensione;
    Object.assign(blocco, { dimensione: processo.dimensione, libero: false, nome: processo.nome, colore: processo.colore });
    
    if (spazioRestante > 0) {
        memoriaRAM.splice(bloccoTrovato + 1, 0, {
            inizio: blocco.inizio + processo.dimensione,
            dimensione: spazioRestante,
            libero: true,
            nome: null,
            colore: null
        });
    }
    
    codaProcessi.splice(indice, 1);
    calcolaStatistiche();
}

// deallocazione
function deallocaProcesso(indice) {
    let blocco = memoriaRAM[indice];
    if (blocco.nome === "SO" || blocco.libero) return;
    
    Object.assign(blocco, { libero: true, nome: null, colore: null });
    
    for (let i = 0; i < memoriaRAM.length - 1; i++) {
        if (memoriaRAM[i].libero && memoriaRAM[i].nome !== "SO" && memoriaRAM[i+1].libero) {
            memoriaRAM[i].dimensione += memoriaRAM[i+1].dimensione;
            memoriaRAM.splice(i+1, 1);
            i--;
        }
    }
    calcolaStatistiche();
}


// CALCOLI 

function calcolaStatistiche() {
    let stats = memoriaRAM.reduce((acc, b) => {
        if (b.libero) {
            acc.libera += b.dimensione;
            acc.liberiCount++;
            acc.maxLibero = Math.max(acc.maxLibero, b.dimensione);
        } else {
            acc.usata += b.dimensione;
        }
        return acc;
    }, { libera: 0, usata: 0, liberiCount: 0, maxLibero: 0 });
    
    let framm = stats.liberiCount > 1 ? stats.libera - stats.maxLibero : 0;
    
    const dati = {
        'statTotale': ramTotale + " KB",
        'statLibera': stats.libera + " KB",
        'statUsata': stats.usata + " KB",
        'statUtilizzo': ((stats.usata / ramTotale) * 100).toFixed(1) + "%",
        'statFramm': framm + " KB"
    };
    
    for (var id in dati) {
        var el = document.getElementById(id);
        if (el) el.textContent = dati[id];
}
}


function mousePressed() {
    let posX = 220;
    let posY = 60;
    
    for (let i = 0; i < codaProcessi.length; i++) {
        if (mouseX > posX && mouseX < posX + 80 && mouseY > posY && mouseY < posY + 50) {
            allocaProcesso(i);
            return;
        }
        
        posX = posX + 90;
        if (posX > 520) {
            posX = 220;
            posY = posY + 60;
        }
    }
    
    // controllo se ho cliccato sulla RAM
    for (let i = 0; i < memoriaRAM.length; i++) {
        let blocco = memoriaRAM[i];
        let bloccoY = 40 + (blocco.inizio / ramTotale) * 300;
        let bloccoAltezza = (blocco.dimensione / ramTotale) * 300;
        
        if (mouseX > 40 && mouseX < 170 && mouseY > bloccoY && mouseY < bloccoY + bloccoAltezza) {
            deallocaProcesso(i);
            return;
        }
    }
}