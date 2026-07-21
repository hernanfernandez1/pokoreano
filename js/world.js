/* ==========================================================
   POKOREANO — Overworld + interior tile engine (canvas)
   Tileset: "Zelda-like tilesets and sprites" by ArMM1998 (CC0)
   assets/gfx/Overworld.png · Inner.png · character.png · NPC_test.png
   ========================================================== */
const World = (() => {
  const TILE = 16;
  const SCALE = 3;

  // ---------- Tile atlas (img: "ow" overworld / "in" interior) ----------
  const TILES = {
    // --- Cute Fantasy (Kenmi) ---
    grass:    { i:"cfg", x:0, y:0 },
    tallgrass:{ i:"tg", x:0,  y:0,  base:true },  // hierba alta procedural estilo pokemon
    flower:   { i:"cfd", x:0, y:1,  base:true },  // flores blancas
    flower2:  { i:"cfd", x:0, y:8,  base:true },  // flores rojas
    flower3:  { i:"cfd", x:1, y:8,  base:true },  // flores amarillas
    tuft:     { i:"cfd", x:1, y:0,  base:true },  // matitas
    mush:     { i:"cfd", x:2, y:7,  base:true },  // seta
    rock:     { i:"cfd", x:1, y:2,  base:true },  // roca
    chest:    { i:"cfch", x:0, y:0, base:true },  // cofre coleccionable
    // agua: blob 3x3 (0,0)-(2,2) + centro profundo
    water:    { i:"cfwm", x:0, y:0 },
    waterT:   { i:"cfw", x:1, y:0 }, waterB:{ i:"cfw", x:1, y:2 },
    waterL:   { i:"cfw", x:0, y:1 }, waterR:{ i:"cfw", x:2, y:1 },
    waterTL:  { i:"cfw", x:0, y:0 }, waterTR:{ i:"cfw", x:2, y:0 },
    waterBL:  { i:"cfw", x:0, y:2 }, waterBR:{ i:"cfw", x:2, y:2 },
    // arena/tierra de playa: blob FarmLand 3x3
    sand:     { i:"cfb", x:1, y:1 },
    sandT:    { i:"cfb", x:1, y:0, base:true }, sandB:{ i:"cfb", x:1, y:2, base:true },
    sandL:    { i:"cfb", x:0, y:1, base:true }, sandR:{ i:"cfb", x:2, y:1, base:true },
    sandTL:   { i:"cfb", x:0, y:0, base:true }, sandTR:{ i:"cfb", x:2, y:0, base:true },
    sandBL:   { i:"cfb", x:0, y:2, base:true }, sandBR:{ i:"cfb", x:2, y:2, base:true },
    // camino: blob Path 3x3 + centro
    path:     { i:"cfpm", x:0, y:0 },
    pathT:    { i:"cfp", x:1, y:0, base:true }, pathB:{ i:"cfp", x:1, y:2, base:true },
    pathL:    { i:"cfp", x:0, y:1, base:true }, pathR:{ i:"cfp", x:2, y:1, base:true },
    pathTL:   { i:"cfp", x:0, y:0, base:true }, pathTR:{ i:"cfp", x:2, y:0, base:true },
    pathBL:   { i:"cfp", x:0, y:2, base:true }, pathBR:{ i:"cfp", x:2, y:2, base:true },
    // muelle vertical (N-S): sección sólida rail|tabla|rail, se repite a lo largo
    pierL: { i:"bvL", x:0, y:0, baseWater:true },
    pierM: { i:"bvM", x:0, y:0, baseWater:true },
    pierR: { i:"bvR", x:0, y:0, baseWater:true },
    // puente horizontal (E-O): la sección vertical rotada 90°
    briT: { i:"bhT", x:0, y:0, baseWater:true },
    briM: { i:"bhM", x:0, y:0, baseWater:true },
    briB: { i:"bhB", x:0, y:0, baseWater:true },
    // cercas (corral)
    fenceH:  { i:"cff", x:2, y:1, base:true },
    fenceV:  { i:"cff", x:0, y:1, base:true },
    fenceTL: { i:"cff", x:1, y:1, base:true }, fenceTR: { i:"cff", x:3, y:1, base:true },
    fenceBL: { i:"cff", x:1, y:3, base:true }, fenceBR: { i:"cff", x:3, y:3, base:true },
    bush:     { i:"bsh", x:0, y:0, base:true },      // arbusto redondo procedural (guardianes)
    bushSand: { i:"bsh", x:0, y:0, baseSand:true },  // arbusto sobre arena
    plank:    { i:"cfpm", x:0, y:0 },
    // cueva (cave.png)
    caveFloorA:{ i:"cv", x:1, y:3 }, caveFloorB:{ i:"cv", x:2, y:3 },
    caveFloorC:{ i:"cv", x:1, y:4 }, caveFloorD:{ i:"cv", x:2, y:4 },
    caveWallTop:{ i:"cv", x:4, y:0 },
    caveWallFace:{ i:"cv", x:2, y:1 },
    caveWallFace2:{ i:"cv", x:2, y:2 },
    caveRock: { i:"cv", x:8, y:4 },
    // interior
    // piso de madera de las casas (assets/gfx/floor_b.png, del B.png de Karol)
    floorA:   { i:"fb", x:0, y:0 }, floorB:{ i:"fb", x:1, y:0 },
    floorC:   { i:"fb", x:0, y:1 }, floorD:{ i:"fb", x:1, y:1 },
    wallTop:  { i:"in", x:4, y:0 },
    wallFace: { i:"in", x:6, y:0 },
    wallFace2:{ i:"in", x:6, y:1 },
    rug:      { i:"in", x:1, y:8, baseFloor:true },
    exitMat:  { i:"in", x:5, y:6 },
  };
  const DECOR = {
    tree:   { i:"oak",  x:0, y:0, w:4, h:5 },   // roble Cute Fantasy (64x80)
    house:  { i:"cfh",  x:0, y:0, w:6, h:8 },   // casa azul (96x128)
    barn:   { i:"cfhB", x:0, y:0, w:6, h:8 },   // casa tinte frío
    houseG: { i:"cfhG", x:0, y:0, w:6, h:8 },   // casa tinte cálido (tienda)
    lamp:   { i:"cfd",  x:4, y:4, w:1, h:3 },   // farol
    caveDoor: { i:"ow", x:4, y:31, w:4, h:2 },  // arco de piedra
    fountain: { i:"ow", x:22, y:9, w:3, h:3 },  // fuente de la plaza (3x3)
  };
  // filas del spritesheet por dirección: 0=abajo,2=arriba; izquierda/derecha van cruzadas
  const DIR_ROW = [0, 3, 2, 1];

  // ---------- Maps (con pila: overworld → cueva → interior) ----------
  let MW, MH, ground, solid, meta, decor, npcsCur, mode = "over";
  let mapStack = [];

  const OW = { W:96, H:72 };

  const gymHouses = [
    { key:"hangul",     x: 10, y: 8,  sprite:"house" },  // pradera NO
    { key:"numeros",    x: 34, y: 6,  sprite:"barn"  },  // pradera N
    { key:"particulas", x: 66, y: 12, sprite:"house" },  // bosque O
    { key:"verbos",     x: 84, y: 22, sprite:"barn"  },  // bosque profundo
    { key:"honor",      x: 72, y: 48, sprite:"house" },  // SE, cerca de la costa
    { key:"topik1",     x: 34, y: 50, sprite:"barn"  },  // costa (puerta a la playa)
    { key:"topik2",     x: 10, y: 36, sprite:"house" },  // pradera O
    // "maestro" vive dentro de la cueva (bioma bosque, NE)
  ];

  // ---------- Overworld NPCs (wander around home) ----------
  const npcsOver = [
    {
      key:"abuela", name:"할머니 (Abuela)", x:33, y:25, dir:0, tint:"#a259ff", hair:"gray", long:true, wander:true,
      lines:[
        { ko:"안녕하세요! 반가워요.", rom:"annyeonghaseyo! bangawoyo.", es:"¡Hola! Encantada de verte." },
        { ko:"한국어 공부는 재미있어요?", rom:"hangugeo gongbuneun jaemiisseoyo?", es:"¿Es divertido estudiar coreano?" },
        { ko:"화이팅!", rom:"hwaiting!", es:"¡Ánimo!" },
      ]
    },
    {
      key:"nino", name:"아이 (Niño)", x:24, y:21, dir:0, tint:"#06d6a0", hair:"black", wander:true,
      lines:[
        { ko:"저는 학생이에요.", rom:"jeoneun haksaeng-ieyo.", es:"Yo soy estudiante." },
        { ko:"너는 이름이 뭐예요?", rom:"neoneun ireumi mwoyeyo?", es:"¿Cómo te llamas?" },
        { ko:"체육관은 저기에 있어요!", rom:"cheyukgwaneun jeogie isseoyo!", es:"¡El gimnasio está por allí!" },
      ]
    },
    {
      key:"vendedor", name:"상인 (Vendedor)", x:31, y:47, dir:0, tint:"#f4a261", wander:true,
      lines:[
        { ko:"어서 오세요!", rom:"eoseo oseyo!", es:"¡Bienvenido!" },
        { ko:"이거 얼마예요? 천 원이에요.", rom:"igeo eolmayeyo? cheon won-ieyo.", es:"¿Cuánto cuesta esto? Son mil wones." },
        { ko:"감사합니다. 또 오세요!", rom:"gamsahamnida. tto oseyo!", es:"Gracias. ¡Vuelve pronto!" },
      ]
    },
    {
      key:"pescador", name:"낚시꾼 (Pescador)", x:16, y:57, dir:0, tint:"#3fa9f5", hair:"black", wander:false,
      lines:[
        { ko:"물고기를 좋아해요?", rom:"mulgogireul joahaeyo?", es:"¿Te gustan los peces?" },
        { ko:"이 호수에는 물고기가 많아요.", rom:"i hosueneun mulgogiga manayo.", es:"En este lago hay muchos peces." },
        { ko:"물하고 불을 혼동하지 마세요!", rom:"mulhago bureul hondonghaji maseyo!", es:"물 (mul) es agua, 불 (bul) es fuego. ¡No los confundas!" },
      ]
    },
    {
      key:"monje", name:"스님 (Monje)", x:58, y:49, dir:0, tint:"#8d6e63", hair:"bald", wander:true,
      lines:[
        { ko:"천천히 하세요.", rom:"cheoncheonhi haseyo.", es:"Hazlo despacio (con calma)." },
        { ko:"매일 조금씩 공부하세요.", rom:"maeil jogeumssik gongbuhaseyo.", es:"Estudia un poco cada día." },
        { ko:"그러면 마스터가 될 거예요.", rom:"geureomyeon maseutoga doel geoyeyo.", es:"Así llegarás a ser un maestro." },
      ]
    },
    {
      key:"guardia", name:"경비원 (Guardia)", x:75, y:10, dir:0, tint:"#e63946", hair:"black", wander:false,
      lines:[
        { ko:"이 동굴 안에 마스터 체육관이 있어요.", rom:"i donggul ane maseuteo cheyukgwani isseoyo.", es:"Dentro de esta cueva está el Gimnasio Maestro." },
        { ko:"메달 일곱 개가 필요해요!", rom:"medal ilgop gaega piryohaeyo!", es:"¡Necesitas siete medallas!" },
        { ko:"동굴에는 도깨비가 살아요… 조심하세요!", rom:"donggureneun dokkaebiga sarayo... josimhaseyo!", es:"En la cueva viven dokkaebi… ¡ten cuidado!" },
      ]
    },
    {
      key:"granjero", name:"농부 (Granjero)", x:45, y:12, dir:0, tint:"#90be6d", hair:"blond", wander:true,
      lines:[
        { ko:"오늘 날씨가 좋아요!", rom:"oneul nalssiga joayo!", es:"¡Hoy hace buen tiempo!" },
        { ko:"저는 밭에서 일해요.", rom:"jeoneun bateseo ilhaeyo.", es:"Yo trabajo en el campo." },
        { ko:"사과 하나 먹을래요?", rom:"sagwa hana meogeullaeyo?", es:"¿Quieres comer una manzana?" },
      ]
    },
    {
      key:"fan", name:"팬 (Fan de K-pop)", x:66, y:56, dir:0, tint:"#ff70a6", hair:"pink", long:true, wander:true,
      lines:[
        { ko:"음악을 좋아해요?", rom:"eumageul joahaeyo?", es:"¿Te gusta la música?" },
        { ko:"콘서트에 가고 싶어요!", rom:"konseoteue gago sipeoyo!", es:"¡Quiero ir a un concierto!" },
        { ko:"같이 노래해요!", rom:"gachi noraehaeyo!", es:"¡Cantemos juntos!" },
      ]
    },
  ];

  function initNpc(n){
    n.home = { x:n.x, y:n.y };
    n.px = n.x*TILE; n.py = n.y*TILE;
    n.tx = n.x; n.ty = n.y;
    n.moving = false; n.frame = 0; n.animT = 0;
    n.nextWander = performance.now() + 1500 + Math.random()*3000;
    return n;
  }
  npcsOver.forEach(initNpc);

  let grassPatches = [];

  // ---------- Build overworld ----------
  function buildOverworld(){
    MW = OW.W; MH = OW.H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<MH;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<MW;x++){
        const r = Math.random();
        ground[y][x] = r<0.90 ? "grass"
          : r<0.93 ? "flower" : r<0.95 ? "tuft"
          : r<0.965 ? "flower2" : r<0.98 ? "flower3"
          : r<0.99 ? "mush" : "rock";
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }

    // praderas floridas (densidad extra de flores)
    const meadows = [[10,24,14,8],[36,26,12,8],[20,38,16,6],[64,36,14,8],[52,8,10,6]];
    meadows.forEach(([mx,my,mw,mh]) => {
      for (let y=my;y<my+mh&&y<MH;y++) for (let x=mx;x<mx+mw&&x<MW;x++){
        const r = Math.random();
        if (r<0.3) ground[y][x] = r<0.16 ? "flower" : "flower2";
      }
    });

    // borde: muro sólido + anillo de árboles (el mar cierra el sur)
    for (let y=0;y<MH;y++) for (let x=0;x<MW;x++){
      if (x<2 || y<2 || x>=MW-2 || y>=MH-2) solid[y][x]=true;
    }
    for (let x=0;x<MW-1;x+=3) putTree(x,0);
    for (let y=3;y<52;y+=3){ putTree(0,y); putTree(MW-2,y); }

    // BIOMA COSTA (sur): mar abierto + playa ancha
    for (let y=62;y<MH;y++) for (let x=0;x<MW;x++){ ground[y][x]="water"; solid[y][x]=true; }
    for (let y=54;y<62;y++) for (let x=2;x<MW-2;x++){
      if (!solid[y][x] && ground[y][x]!=="water") ground[y][x]="sand";
    }

    // río (x 48-50) que baja hasta el mar
    for (let y=2;y<62;y++) for (let x=48;x<51;x++){ ground[y][x]="water"; solid[y][x]=true; }

    // lago de la pradera
    for (let y=28;y<34;y++) for (let x=14;x<21;x++){ ground[y][x]="water"; solid[y][x]=true; }

    // caminos (blob autotile)
    const pathH = (y) => { for (let x=2;x<MW-2;x++){ if (!solid[y][x]) ground[y][x]="path"; if (!solid[y+1][x]) ground[y+1][x]="path"; } };
    const pathV = (x,y0,y1) => { for (let y=y0;y<y1;y++){ if (!solid[y][x]) ground[y][x]="path"; if (!solid[y][x+1]) ground[y][x+1]="path"; } };
    pathH(20); pathH(46);
    pathV(30,2,54); pathV(62,2,54);
    // puentes de madera sobre el río (E-O, 3 tiles de alto: rail/tabla/rail)
    [20, 46].forEach(cy => {
      for (let x=48;x<=50;x++){
        ground[cy-1][x]="briT"; ground[cy][x]="briM"; ground[cy+1][x]="briB";
        solid[cy-1][x]=false; solid[cy][x]=false; solid[cy+1][x]=false;
      }
    });

    // árboles dispersos por la pradera y la costa alta
    [[8,14],[20,10],[26,16],[40,10],[14,22],[24,26],[40,30],[10,42],[24,43],[42,40],
     [6,30],[34,36],[44,22],[18,34],[36,16],[6,50],[26,50],[44,50],[56,38],[70,42],
     [86,43],[90,34],[56,50],[80,50],[12,50]]
      .forEach(([x,y]) => putTree(x,y));

    // BIOMA BOSQUE (NE): denso, con claro hacia la cueva y corredores en los caminos
    for (let fy=3; fy<32; fy+=4){
      for (let fx=56; fx<92; fx+=5){
        const jx = fx + (Math.random()*3|0), jy = fy + (Math.random()*2|0);
        if (jx>=72 && jx<=84 && jy<=20) continue;       // claro de la cueva
        if (jy>=18 && jy<=21) continue;                 // corredor del camino y=20
        if (jx>=60 && jx<=63) continue;                 // corredor del camino x=62
        if (decor[jy]?.[jx]) continue;
        putTree(jx,jy);
      }
    }
    // matas entre los árboles del bosque
    for (let i=0;i<40;i++){
      const x = 56 + (Math.random()*36|0), y = 3 + (Math.random()*29|0);
      if (!solid[y]?.[x] && !meta[y]?.[x] && !decor[y]?.[x] && ground[y][x]==="grass") ground[y][x]="tallgrass";
    }
    // matas dispersas en pradera/costa
    for (let i=0;i<30;i++){
      const x = 4 + (Math.random()*44|0), y = 4 + (Math.random()*48|0);
      if (!solid[y]?.[x] && !meta[y]?.[x] && !decor[y]?.[x] && ground[y][x]==="grass") ground[y][x]="tallgrass";
    }

    gymHouses.forEach(g => putHouse(g));

    // TIENDA (junto al cruce de caminos)
    putShop(38, 12);

    // CASA DE KAROL (base, en la pradera noroeste)
    putHome(18, 10);

    // Entrada a la CUEVA (claro del bosque, NE)
    putCaveEntrance(76, 6);

    // PUERTA DEL PUEBLO (arco al oeste, sobre el camino y=20)
    decor[18][3] = { sprite:"caveDoor", pueblo:true };
    for (let dy=0;dy<2;dy++) for (let dx=0;dx<4;dx++){
      if (solid[18+dy]?.[3+dx] === undefined) continue;
      solid[18+dy][3+dx]=true; meta[18+dy][3+dx]=null;
    }
    [4,5].forEach(x => { solid[19][x]=false; meta[19][x]={type:"pueblodoor"}; });

    // MUELLE DE PESCA (puente vertical hacia el mar, 3 tiles de ancho)
    for (let y=59;y<=66;y++){
      ground[y][23]="pierL"; ground[y][24]="pierM"; ground[y][25]="pierR";
      [23,24,25].forEach(x => { solid[y][x]=false; meta[y][x]=null; });
    }
    meta[66][24] = { type:"fishspot" };

    // CORRAL del granjero (cerca con animales)
    for (let x=42;x<=48;x++){ ground[9][x] = x===42?"fenceTL":(x===48?"fenceTR":"fenceH"); solid[9][x]=true; }
    for (let x=42;x<=48;x++){ if (x===45) continue; ground[14][x] = x===42?"fenceBL":(x===48?"fenceBR":"fenceH"); solid[14][x]=true; }
    for (let y=10;y<14;y++){ ground[y][42]="fenceV"; solid[y][42]=true; ground[y][48]="fenceV"; solid[y][48]=true; }
    spawnAnimals();

    // COFRES escondidos (monedas)
    [[6,6,"c1"],[90,50,"c2"],[68,32,"c3"],[8,58,"c4"],[90,8,"c5"]].forEach(([x,y,id]) => {
      if (solid[y]?.[x] || meta[y]?.[x] || decor[y]?.[x]) return;
      const s = State.get();
      if ((s.chests||[]).includes(id)) return;
      ground[y][x] = "chest";
      meta[y][x] = { type:"chest", id };
    });

    // ARBUSTOS de guardianes por bioma (aleatorios en zonas válidas)
    const tryBush = (biome,x,y) => {
      if (solid[y]?.[x] || meta[y]?.[x] || decor[y]?.[x]) return;
      const g = ground[y][x];
      if (!["grass","sand","flower","flower2","flower3","tuft"].includes(g)) return;
      ground[y][x] = (g==="sand") ? "bushSand" : "bush";
      meta[y][x]={type:"bush",biome};
    };
    for (let i=0;i<26;i++) tryBush("pradera", 4+(Math.random()*44|0), 4+(Math.random()*46|0));
    for (let i=0;i<20;i++) tryBush("bosque", 54+(Math.random()*38|0), 3+(Math.random()*30|0));
    for (let i=0;i<18;i++) tryBush("costa", 3+(Math.random()*90|0), 54+(Math.random()*8|0));

    npcsCur = npcsOver;
    npcsCur.forEach(n => { solid[n.y][n.x]=true; meta[n.y][n.x]={type:"npc",npc:n}; });

    grassPatches = [
      { x:16, y:4,  w:8, h:4, pool: Data.routes[0].pool },  // NO (hangul)
      { x:38, y:5,  w:7, h:4, pool: Data.routes[1].pool },  // N (numeros)
      { x:86, y:26, w:6, h:5, pool: Data.routes[2].pool },  // E bosque (verbos)
      { x:66, y:44, w:7, h:4, pool: Data.routes[3].pool },  // SE (honor)
      { x:20, y:48, w:8, h:4, pool: Data.routes[4].pool },  // S (topik1)
      { x:4,  y:20, w:5, h:7, pool: Data.routes[5].pool },  // O (topik2)
      { x:36, y:32, w:6, h:5, pool: Data.routes[2].pool },  // centro
      { x:54, y:34, w:6, h:4, pool: Data.routes[1].pool },  // centro-este
      { x:8,  y:44, w:7, h:3, pool: Data.routes[5].pool },  // SO
      { x:76, y:14, w:6, h:4, pool: Data.routes[3].pool },  // claro de la cueva
    ];
    grassPatches.forEach(p => {
      for (let y=p.y;y<p.y+p.h;y++) for (let x=p.x;x<p.x+p.w;x++){
        if (!solid[y]?.[x] && !meta[y]?.[x]) { ground[y][x]="tallgrass"; meta[y][x]={type:"grass",pool:p.pool}; }
      }
    });

    spawnButterflies();
    mode = "over";
  }

  function putTree(x,y){
    if (y+1>=MH || x+1>=MW) return;
    decor[y][x] = { sprite:"tree" };
    // roble 4x5: sólo el tronco bloquea (2x2 abajo al centro)
    for (let dy=2;dy<5;dy++) for (let dx=1;dx<3;dx++){
      if (solid[y+dy]?.[x+dx] !== undefined) solid[y+dy][x+dx]=true;
    }
  }

  function clearTreesRect(x0,y0,x1,y1){
    for (let dy=y0;dy<=y1;dy++) for (let dx=x0;dx<=x1;dx++){
      if (decor[dy]?.[dx]?.sprite === "tree"){
        decor[dy][dx] = null;
        for (let ty=2;ty<5;ty++) for (let tx=1;tx<3;tx++){
          if (solid[dy+ty]?.[dx+tx] !== undefined) solid[dy+ty][dx+tx]=false;
        }
      }
    }
  }
  // Casa Cute Fantasy 6x8: base solida = filas 4-7, puerta abajo al centro
  function putHouse(g){
    const x=g.x, y=g.y;
    clearTreesRect(x-4, y-5, x+7, y+9);
    decor[y][x] = { sprite:g.sprite, gym:g.key };
    for (let dy=4;dy<8;dy++) for (let dx=0;dx<6;dx++){
      if (solid[y+dy] === undefined || solid[y+dy][x+dx] === undefined) continue;
      solid[y+dy][x+dx]=true; meta[y+dy][x+dx]=null;
    }
    const doorX=x+2, doorY=y+7;
    solid[doorY][doorX]=false;
    meta[doorY][doorX]={type:"gymdoor", key:g.key};
    if (doorY+1 < MH){
      solid[doorY+1][doorX]=false;
      ground[doorY+1][doorX]="path";
      meta[doorY+1][doorX]=null;
    }
  }

  function putCaveEntrance(x,y){
    decor[y][x] = { sprite:"caveDoor" };
    for (let dy=0;dy<2;dy++) for (let dx=0;dx<4;dx++){
      if (solid[y+dy] === undefined || solid[y+dy][x+dx] === undefined) continue;
      solid[y+dy][x+dx]=true; meta[y+dy][x+dx]=null;
    }
    [x+1,x+2].forEach(dx0 => {
      solid[y+1][dx0]=false;
      meta[y+1][dx0]={type:"cavedoor"};
    });
    if (y+2 < MH){
      [x+1,x+2].forEach(dx0 => { solid[y+2][dx0]=false; ground[y+2][dx0]="dirtA"; meta[y+2][dx0]=null; });
    }
  }

  // ---------- Tienda ----------
  function putBuilding(x, y, sprite, doorType, tag){
    clearTreesRect(x-4, y-5, x+7, y+9);
    const d = { sprite }; if (tag) d[tag]=true;
    decor[y][x] = d;
    for (let dy=4;dy<8;dy++) for (let dx=0;dx<6;dx++){
      if (solid[y+dy] === undefined || solid[y+dy][x+dx] === undefined) continue;
      solid[y+dy][x+dx]=true; meta[y+dy][x+dx]=null;
    }
    const doorX=x+2, doorY=y+7;
    solid[doorY][doorX]=false;
    meta[doorY][doorX]={type:doorType};
    if (doorY+1 < MH){
      solid[doorY+1][doorX]=false;
      ground[doorY+1][doorX]="path";
      meta[doorY+1][doorX]=null;
    }
  }
  function putShop(x,y){ putBuilding(x, y, "houseG", "shopdoor", "shop"); }
  function putHome(x,y){ putBuilding(x, y, "house", "casadoor", "casa"); }

  function buildShopInterior(){
    const W=11, H=8;
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        ground[y][x] = (x%2===0 ? (y%2===0?"floorA":"floorC") : (y%2===0?"floorB":"floorD"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    for (let x=0;x<W;x++){
      ground[0][x]="wallTop"; solid[0][x]=true;
      ground[1][x]="wallFace"; solid[1][x]=true;
      ground[2][x]="wallFace2"; solid[2][x]=true;
    }
    for (let y=0;y<H;y++){
      solid[y][0]=true; solid[y][W-1]=true;
      if (y>0){ ground[y][0]="wallTop"; ground[y][W-1]="wallTop"; }
    }
    for (let x=0;x<W;x++){ if (x!==5){ ground[H-1][x]="wallTop"; solid[H-1][x]=true; } }
    // mostrador (alfombra) + tendero
    for (let x=4;x<7;x++) ground[3][x]="rug";
    const keeper = initNpc({
      key:"tendero", name:"주인 아저씨 (Tendero)", x:5, y:3, dir:0, tint:"#f4a261", hair:"black",
      wander:false, isShop:true,
      lines:[
        { ko:"어서 오세요! 뭐 드릴까요?", rom:"eoseo oseyo! mwo deurilkkayo?", es:"¡Bienvenida! ¿Qué te doy?" },
      ]
    });
    npcsCur = [keeper];
    solid[keeper.y][keeper.x]=true;
    meta[keeper.y][keeper.x]={type:"npc", npc:keeper};
    // salida
    ground[H-1][5]="exitMat"; solid[H-1][5]=false;
    meta[H-1][5]={type:"exit"};

    player.x=player.tx=5; player.y=player.ty=H-2;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode="tienda";
    petTeleport();
  }
  function enterShop(){
    pushMap();
    Sfx.play("door");
    buildShopInterior();
  }

  // ---------- Pueblo (마을) ----------
  function buildPueblo(){
    const W=34, H=24;
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        const r = Math.random();
        ground[y][x] = r<0.9 ? "grass" : (r<0.94 ? "flower" : (r<0.97 ? "tuft" : "flower2"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    // borde con árboles
    for (let y=0;y<H;y++) for (let x=0;x<W;x++){
      if (x<2 || y<2 || x>=W-2 || y>=H-2) solid[y][x]=true;
    }
    // árboles sur solo donde no pisen edificios (casa 4-9, plaza 13-21, norebang 24-29)
    const treeBlocked = (x) => (x+3>=4 && x<=9) || (x+3>=13 && x<=21) || (x+3>=24 && x<=29);
    for (let x=0;x<W-1;x+=3){ if (!treeBlocked(x)) putTree(x,H-4); }
    for (let y=2;y<H-4;y+=4){ putTree(0,y); putTree(W-4,y); }

    // calle principal (cruz) + plaza con fuente
    for (let x=2;x<W-2;x++){ ground[15][x]="path"; ground[16][x]="path"; }
    for (let y=8;y<H-2;y++){ ground[y][16]="path"; ground[y][17]="path"; }
    for (let y=12;y<19;y++) for (let x=13;x<21;x++) ground[y][x]="path";
    decor[12][15] = { sprite:"fountain" };
    for (let dy=0;dy<3;dy++) for (let dx=0;dx<3;dx++) solid[12+dy][15+dx]=true;
    decor[10][12] = { sprite:"lamp" };  solid[12][12]=true;
    decor[10][21] = { sprite:"lamp" };  solid[12][21]=true;

    const placeBuilding = (spr, x, y, doorType, extra) => {
      decor[y][x] = Object.assign({ sprite:spr }, extra||{});
      for (let dy=4;dy<8;dy++) for (let dx=0;dx<6;dx++){
        if (solid[y+dy]?.[x+dx] === undefined) continue;
        solid[y+dy][x+dx]=true; meta[y+dy][x+dx]=null;
      }
      if (doorType){
        solid[y+7][x+2]=false; meta[y+7][x+2]={type:doorType};
        if (y+8<H){ solid[y+8][x+2]=false; ground[y+8][x+2]="path"; meta[y+8][x+2]=null; }
      }
    };

    // ALCALDÍA (norte centro) — casa cálida grande
    placeBuilding("houseG", 14, 0, "alcaldiadoor", { alcaldia:true });
    // CAFÉ (oeste) — casa azul
    placeBuilding("house", 4, 3, "cafedoor", { cafe:true });
    // ACADEMIA (este) — casa con tinte frío
    placeBuilding("barn", 24, 3, "academiadoor", { academia:true });
    // casa de la abuela + NOREBANG (karaoke 노래방)
    placeBuilding("house", 4, 15, "abuelacasadoor");
    placeBuilding("barn", 24, 15, "norebangdoor", { norebang:true });

    // NPCs del pueblo
    const npcs = [];
    npcs.push(initNpc({
      key:"vecina", name:"이웃 (Vecina)", x:12, y:18, dir:0, tint:"#7fd8ff", hair:"black", long:true, wander:true,
      lines:[
        { ko:"우리 마을에 온 걸 환영해요!", rom:"uri maeure on geol hwanyeonghaeyo!", es:"¡Bienvenida a nuestro pueblo!" },
        { ko:"카페하고 학원도 가 보세요.", rom:"kapehago hagwondo ga boseyo.", es:"Visita también el café y la academia." },
      ]
    }));
    npcs.push(initNpc({
      key:"ninoPueblo", name:"소년 (Niño)", x:21, y:18, dir:0, tint:"#06d6a0", hair:"black", wander:true,
      lines:[
        { ko:"학원에서 한국어를 배워요.", rom:"hagwoneseo hangugeoreul baewoyo.", es:"En la academia se aprende coreano." },
        { ko:"재미있어요!", rom:"jaemiisseoyo!", es:"¡Es divertido!" },
      ]
    }));
    npcs.push(initNpc({
      key:"abueloPueblo", name:"할아버지 (Abuelo)", x:20, y:9, dir:0, tint:"#c8a27a", hair:"gray", wander:false,
      lines:[
        { ko:"천천히 걸으세요.", rom:"cheoncheonhi georeuseyo.", es:"Camina con calma." },
        { ko:"우리 마을은 평화로워요.", rom:"uri maeureun pyeonghwarowoyo.", es:"Nuestro pueblo es tranquilo." },
      ]
    }));
    // la rival de pronunciación (junto al norebang)
    npcs.push(initNpc({
      key:"rival", name:"리나 (Rina, rival)", x:22, y:20, dir:0, tint:"#b14aed", hair:"pink", long:true,
      wander:false, action:"duel", actionLabel:"🎤 ¡duelo de pronunciación!",
      lines:[
        { ko:"내 발음이 제일 좋아!", rom:"nae bareumi jeil joa!", es:"¡Mi pronunciación es la mejor!" },
        { ko:"나랑 대결할래?", rom:"narang daegyeolhallae?", es:"¿Quieres un duelo conmigo?" },
      ]
    }));
    npcsCur = npcs;
    npcs.forEach(n => { solid[n.y][n.x]=true; meta[n.y][n.x]={type:"npc",npc:n}; });

    // salida al sur
    [16,17].forEach(x => { ground[H-1][x]="path"; solid[H-1][x]=false; meta[H-1][x]={type:"exit"}; ground[H-2][x]="path"; solid[H-2][x]=false; });

    player.x=player.tx=16; player.y=player.ty=H-2;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode="pueblo";
    petTeleport();
  }
  function enterPueblo(){
    pushMap();
    Sfx.play("door");
    buildPueblo();
  }

  // ---------- Helper: habitación interior simple ----------
  function buildRoom(W, H, npc, modeName, floorTiles){
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        ground[y][x] = (x%2===0 ? (y%2===0?"floorA":"floorC") : (y%2===0?"floorB":"floorD"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    for (let x=0;x<W;x++){
      ground[0][x]="wallTop"; solid[0][x]=true;
      ground[1][x]="wallFace"; solid[1][x]=true;
      ground[2][x]="wallFace2"; solid[2][x]=true;
    }
    for (let y=0;y<H;y++){
      solid[y][0]=true; solid[y][W-1]=true;
      if (y>0){ ground[y][0]="wallTop"; ground[y][W-1]="wallTop"; }
    }
    const doorX = (W>>1);
    for (let x=0;x<W;x++){ if (x!==doorX){ ground[H-1][x]="wallTop"; solid[H-1][x]=true; } }
    for (let x=doorX-1;x<=doorX+1;x++) if (ground[3][x]!==undefined) ground[3][x]="rug";
    if (floorTiles) floorTiles();

    npc.x = doorX; npc.y = 3;
    initNpc(npc);
    npcsCur = [npc];
    solid[npc.y][npc.x]=true;
    meta[npc.y][npc.x]={type:"npc",npc};

    ground[H-1][doorX]="exitMat"; solid[H-1][doorX]=false;
    meta[H-1][doorX]={type:"exit"};

    player.x=player.tx=doorX; player.y=player.ty=H-2;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode=modeName;
    petTeleport();
  }

  // ---------- Café (카페) ----------
  function buildCafe(){
    buildRoom(11, 8, {
      key:"barista", name:"바리스타 (Barista)", dir:0, tint:"#c86b3c", hair:"black",
      wander:false, action:"cafe", actionLabel:"☕ ver el menú",
      lines:[
        { ko:"카페에 오신 걸 환영해요!", rom:"kapee osin geol hwanyeonghaeyo!", es:"¡Bienvenida al café!" },
        { ko:"뭐 주문하시겠어요?", rom:"mwo jumunhasigesseoyo?", es:"¿Qué desea ordenar?" },
      ]
    }, "cafe");
  }
  function enterCafe(){ pushMap(); Sfx.play("door"); buildCafe(); }

  // ---------- Academia (학원) ----------
  function buildAcademia(){
    buildRoom(13, 9, {
      key:"maestra", name:"선생님 (Maestra)", dir:0, tint:"#4361ee", hair:"black", long:true,
      wander:false, action:"class", actionLabel:"📚 tomar clase",
      lines:[
        { ko:"학원에 오신 걸 환영해요!", rom:"hagwone osin geol hwanyeonghaeyo!", es:"¡Bienvenida a la academia!" },
        { ko:"오늘 복습할까요?", rom:"oneul bokseuphalkkayo?", es:"¿Repasamos hoy?" },
      ]
    }, "academia");
  }
  function enterAcademia(){ pushMap(); Sfx.play("door"); buildAcademia(); }

  // ---------- Norebang (노래방 · karaoke) ----------
  function buildNorebang(){
    buildRoom(11, 8, {
      key:"dj", name:"디제이 (DJ)", dir:0, tint:"#ff70a6", hair:"pink",
      wander:false, action:"karaoke", actionLabel:"🎤 ¡a cantar!",
      lines:[
        { ko:"노래방에 오신 걸 환영해요!", rom:"noraebange osin geol hwanyeonghaeyo!", es:"¡Bienvenida al karaoke!" },
        { ko:"마이크 준비됐어요?", rom:"maikeu junbidwaesseoyo?", es:"¿Lista con el micrófono?" },
      ]
    }, "norebang");
  }
  function enterNorebang(){ pushMap(); Sfx.play("door"); buildNorebang(); }

  // ---------- Casa de la abuela (할머니 집) ----------
  function buildAbuelaCasa(){
    buildRoom(9, 8, {
      key:"abuela_casa", name:"할머니 (Abuela)", dir:0, tint:"#c8a27a", hair:"gray", long:true,
      wander:false, action:null, actionLabel:"✕ cerrar",
      lines:[
        { ko:"어서 와요, 우리 집에!", rom:"eoseo wayo, uri jibe!", es:"¡Bienvenida a mi casa!" },
        { ko:"밥 먹었어요?", rom:"bap meogeosseoyo?", es:"¿Ya comiste? (saludo cariñoso coreano)" },
        { ko:"공부 열심히 하세요~", rom:"gongbu yeolsimhi haseyo~", es:"Estudia con ganas~" },
      ]
    }, "abuelacasa");
  }
  function enterAbuelaCasa(){ pushMap(); Sfx.play("door"); buildAbuelaCasa(); }

  // ---------- Casa de Karol (집) ----------
  function buildHome(){
    buildRoom(11, 8, {
      key:"gato_casa", name:"고양이 (Gato)", dir:0, tint:"#e8a24a", hair:"black",
      wander:true, action:null, actionLabel:"✕ cerrar",
      lines:[
        { ko:"야옹~ 집이 최고예요.", rom:"yaong~ jibi choegoyeyo.", es:"Miau~ el hogar es lo mejor." },
      ]
    }, "casa", () => {
      // punto de guardado + cama
      meta[3][2] = { type:"save" };
      ground[3][2] = "rug";
    });
    Sfx.play("ok");
  }
  function enterHome(){ pushMap(); Sfx.play("door"); buildHome(); }

  // ---------- Alcaldía (interior) ----------
  function buildAlcaldia(){
    const W=13, H=9;
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        ground[y][x] = (x%2===0 ? (y%2===0?"floorA":"floorC") : (y%2===0?"floorB":"floorD"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    for (let x=0;x<W;x++){
      ground[0][x]="wallTop"; solid[0][x]=true;
      ground[1][x]="wallFace"; solid[1][x]=true;
      ground[2][x]="wallFace2"; solid[2][x]=true;
    }
    for (let y=0;y<H;y++){
      solid[y][0]=true; solid[y][W-1]=true;
      if (y>0){ ground[y][0]="wallTop"; ground[y][W-1]="wallTop"; }
    }
    for (let x=0;x<W;x++){ if (x!==6){ ground[H-1][x]="wallTop"; solid[H-1][x]=true; } }
    for (let x=5;x<8;x++) ground[3][x]="rug";

    // La alcaldesa: sus líneas dependen de la misión actual
    const q = Quests.current();
    const lines = [
      { ko:"어서 오세요! 저는 시장이에요.", rom:"eoseo oseyo! jeoneun sijang-ieyo.", es:"¡Bienvenida! Yo soy la alcaldesa." },
    ];
    if (q){
      lines.push({ ko:"당신의 임무예요!", rom:"dangsinui immuyeyo!", es:`Tu misión (Cap. ${q.cap}): ${q.title} — ${q.desc}` });
      lines.push({ ko:"화이팅!", rom:"hwaiting!", es:"¡Ánimo! Vuelve cuando la termines." });
    } else {
      lines.push({ ko:"당신은 진정한 마스터예요!", rom:"dangsineun jinjeonghan maseuteoyeyo!", es:"¡Ya eres una verdadera maestra del coreano!" });
    }
    const alcaldesa = initNpc({
      key:"alcalde", name:"시장님 (Alcaldesa)", x:6, y:3, dir:0,
      tint:"#a259ff", hair:"gray", long:true, wander:false, lines,
    });
    npcsCur = [alcaldesa];
    solid[alcaldesa.y][alcaldesa.x]=true;
    meta[alcaldesa.y][alcaldesa.x]={type:"npc",npc:alcaldesa};

    ground[H-1][6]="exitMat"; solid[H-1][6]=false;
    meta[H-1][6]={type:"exit"};

    player.x=player.tx=6; player.y=player.ty=H-2;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode="alcaldia";
    petTeleport();
  }
  function enterAlcaldia(){
    pushMap();
    Sfx.play("door");
    buildAlcaldia();
  }

  // ---------- Cueva (bioma subterráneo, con el Gimnasio Maestro) ----------
  function buildCave(){
    const W=22, H=14;
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        ground[y][x] = (x%2===0 ? (y%2===0?"caveFloorA":"caveFloorC") : (y%2===0?"caveFloorB":"caveFloorD"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    for (let x=0;x<W;x++){
      ground[0][x]="caveWallTop"; solid[0][x]=true;
      ground[1][x]="caveWallFace"; solid[1][x]=true;
      ground[2][x]="caveWallFace2"; solid[2][x]=true;
    }
    for (let y=0;y<H;y++){
      ground[y][0]="caveWallTop"; solid[y][0]=true;
      ground[y][W-1]="caveWallTop"; solid[y][W-1]=true;
    }
    for (let x=0;x<W;x++){ if (x!==11){ ground[H-1][x]="caveWallTop"; solid[H-1][x]=true; } }

    // Puerta del Gimnasio Maestro (alfombra en el muro norte)
    ground[2][11] = "rug";
    solid[2][11] = false;
    meta[2][11] = { type:"gymdoor", key:"maestro" };

    // salida (sur)
    ground[H-1][11] = "exitMat";
    solid[H-1][11] = false;
    meta[H-1][11] = { type:"exit" };

    // rocas con guardianes de cueva (equivalente a arbustos)
    [[4,5],[5,5],[9,8],[10,8],[15,5],[16,5],[18,10],[6,10],[13,10],[17,7]].forEach(([x,y]) => {
      if (solid[y]?.[x] || meta[y]?.[x]) return;
      ground[y][x] = "caveRock";
      meta[y][x] = { type:"bush", biome:"cueva" };
    });

    npcsCur = [];
    player.x=player.tx=11; player.y=player.ty=H-2;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode="cueva";
    petTeleport();
  }

  // ---------- Interior ----------
  function buildInterior(gym){
    const W=13, H=10;
    MW=W; MH=H;
    ground=[]; solid=[]; meta=[]; decor=[];
    for (let y=0;y<H;y++){
      ground[y]=[]; solid[y]=[]; meta[y]=[]; decor[y]=[];
      for (let x=0;x<W;x++){
        ground[y][x] = (x%2===0 ? (y%2===0?"floorA":"floorC") : (y%2===0?"floorB":"floorD"));
        solid[y][x]=false; meta[y][x]=null; decor[y][x]=null;
      }
    }
    // walls
    for (let x=0;x<W;x++){
      ground[0][x]="wallTop"; solid[0][x]=true;
      ground[1][x]="wallFace"; solid[1][x]=true;
      ground[2][x]="wallFace2"; solid[2][x]=true;
    }
    for (let y=0;y<H;y++){
      solid[y][0]=true; solid[y][W-1]=true;
      if (y>0){ ground[y][0]="wallTop"; ground[y][W-1]="wallTop"; }
    }
    for (let x=0;x<W;x++){ ground[H-1][x] = x===6 ? ground[H-1][x] : "wallTop"; solid[H-1][x] = x!==6; }
    // rug in front of leader
    for (let y=4;y<6;y++) for (let x=5;x<8;x++) ground[y][x]="rug";
    // exit mat bottom center
    const ex=6, ey=H-1;
    ground[ey][ex]="exitMat"; solid[ey][ex]=false;
    meta[ey][ex]={type:"exit"};

    // leader NPC
    const leader = initNpc({
      name:`${gym.leader} — ${gym.name}`,
      x:6, y:3, dir:0, tint:"#ffd166", hair:"black", wander:false, isLeaderOf:gym,
      lines:[
        { ko:`안녕하세요! 저는 ${gym.leader}입니다.`, rom:"annyeonghaseyo! jeoneun ... imnida.", es:`¡Hola! Yo soy ${gym.leader}.` },
        { ko:"준비됐어요? 시험을 시작할까요?", rom:"junbidwaesseoyo? siheomeul sijakhalkkayo?", es:`¿Listo? ${gym.description} ¡Empecemos el examen!` },
      ]
    });
    npcsCur = [leader];
    solid[leader.y][leader.x]=true;
    meta[leader.y][leader.x]={type:"npc", npc:leader};

    // place player at exit
    player.x=player.tx=ex; player.y=player.ty=ey-1;
    player.px=player.x*TILE; player.py=player.y*TILE;
    player.dir=2;
    mode="interior";
    petTeleport();
  }

  // ---------- Pila de mapas ----------
  function pushMap(){
    mapStack.push({
      ground, solid, meta, decor, MW, MH, mode,
      npcs: npcsCur, grassPatches,
      pos: { x:player.x, y:player.y },
    });
  }
  function enterInterior(gym){
    pushMap();
    Sfx.play("door");
    buildInterior(gym);
  }
  function enterCave(){
    pushMap();
    Sfx.play("door");
    buildCave();
  }
  function exitMap(){
    const st = mapStack.pop();
    if (!st) return;
    ({ ground, solid, meta, decor, MW, MH, mode } = st);
    npcsCur = st.npcs;
    grassPatches = st.grassPatches;
    Sfx.play("door");
    const px = st.pos.x;
    const py = (st.pos.y+1 < MH && !solid[st.pos.y+1]?.[px]) ? st.pos.y+1 : st.pos.y;
    player.x=player.tx=px; player.y=player.ty=py;
    player.px=px*TILE; player.py=py*TILE;
    player.dir=0;
    petTeleport();
  }

  // ---------- Assets ----------
  let imgs = {}, ready=false;
  function loadImg(src){
    return new Promise(res => { const i=new Image(); i.onload=()=>res(i); i.onerror=()=>res(i); i.src=src; });
  }
  // Tinte multiplicativo suave para variantes de edificios
  function makeTintedCanvas(img, rgb, amt){
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0,0,c.width,c.height);
    const p = d.data;
    for (let i=0;i<p.length;i+=4){
      if (p[i+3]<128) continue;
      p[i]   = (p[i]  *(1-amt) + rgb[0]*amt) | 0;
      p[i+1] = (p[i+1]*(1-amt) + rgb[1]*amt) | 0;
      p[i+2] = (p[i+2]*(1-amt) + rgb[2]*amt) | 0;
    }
    x.putImageData(d,0,0);
    return c;
  }
  // Animales: hoja 2x2 de 32x32 mirando a la izquierda → [normal, espejo]
  function makeAnimalSheets(img){
    const L = document.createElement("canvas");
    L.width = img.width; L.height = img.height;
    L.getContext("2d").drawImage(img, 0, 0);
    const R = document.createElement("canvas");
    R.width = img.width; R.height = img.height;
    const g = R.getContext("2d");
    g.translate(img.width, 0); g.scale(-1, 1);
    g.drawImage(img, 0, 0);
    return { L, R };
  }
  // Hierba alta estilo pokemon: matas oscuras en zigzag (procedural)
  // Hierba alta estilo Cute Fantasy (paleta armónica con Grass_Middle)
  function makeTallGrassTile(){
    const c = document.createElement("canvas");
    c.width = TILE; c.height = TILE;
    const x = c.getContext("2d");
    const dark = "#2f6b3c", mid = "#3f8b4b", light = "#6cbf5f";
    // sombra de suelo bajo la mata
    x.fillStyle = "rgba(30,60,35,.28)";
    x.fillRect(2,13,12,2);
    // mata densa: matorral redondeado
    const blade = (tx,ty,h,col) => { x.fillStyle=col; x.fillRect(tx,ty,1,h); };
    // capa base oscura
    for (let i=0;i<8;i++){ blade(1+i*2, 5+((i*3)%3), 9, dark); }
    // capa media
    for (let i=0;i<7;i++){ blade(2+i*2, 4+((i*5)%3), 9, mid); }
    // puntas claras
    x.fillStyle = light;
    [ [3,4],[6,3],[9,4],[12,3],[5,6],[10,6],[2,7],[13,6] ].forEach(([bx,by])=>{
      x.fillRect(bx,by,1,2);
    });
    return c;
  }
  // Casa con tinte frío (variante para los gimnasios que usaban el granero)
  function makeTintedHouse(ow){
    const c = document.createElement("canvas");
    c.width = 5*TILE; c.height = 5*TILE;
    const x = c.getContext("2d");
    x.drawImage(ow, 6*TILE, 0, 5*TILE, 5*TILE, 0, 0, 5*TILE, 5*TILE);
    const d = x.getImageData(0,0,c.width,c.height);
    const p = d.data;
    for (let i=0;i<p.length;i+=4){
      if (p[i+3]<128) continue;
      p[i]   = (p[i]  *0.72 + 96 *0.28) | 0;
      p[i+1] = (p[i+1]*0.72 + 110*0.28) | 0;
      p[i+2] = (p[i+2]*0.72 + 160*0.28) | 0;
    }
    x.putImageData(d,0,0);
    return c;
  }
  // Arbusto redondo estilo pokemon (procedural): mata densa con brillos
  function makeBushTile(){
    const c = document.createElement("canvas");
    c.width = TILE; c.height = TILE;
    const x = c.getContext("2d");
    const dark = "#14522a", mid = "#1e7038", hi = "#2f8f4a", shadow = "rgba(0,0,0,.25)";
    // sombra en el suelo
    x.fillStyle = shadow; x.fillRect(2,13,12,2);
    // copa redonda (blob)
    x.fillStyle = dark;
    x.fillRect(3,3,10,10); x.fillRect(2,5,12,7); x.fillRect(4,2,8,12);
    x.fillStyle = mid;
    x.fillRect(4,4,8,8); x.fillRect(3,6,10,5);
    // mechones de brillo
    x.fillStyle = hi;
    x.fillRect(5,4,2,2); x.fillRect(9,5,2,1); x.fillRect(4,8,1,2);
    x.fillRect(8,8,2,2); x.fillRect(11,7,1,2); x.fillRect(6,10,2,1);
    // muescas oscuras (textura de hojas)
    x.fillStyle = dark;
    x.fillRect(7,6,1,1); x.fillRect(10,9,1,1); x.fillRect(5,11,1,1);
    return c;
  }
  // Mariposas (2 frames, varios colores) — vida ambiental
  function makeButterflyFrames(color){
    return [0,1].map(f => {
      const c = document.createElement("canvas");
      c.width = 8; c.height = 8;
      const x = c.getContext("2d");
      x.fillStyle = color;
      if (f===0){ // alas abiertas
        x.fillRect(1,2,2,3); x.fillRect(5,2,2,3);
        x.fillRect(1,5,1,1); x.fillRect(6,5,1,1);
      } else {    // alas cerradas
        x.fillRect(2,2,1,3); x.fillRect(5,2,1,3);
      }
      x.fillStyle = "#222";
      x.fillRect(3,2,2,4);
      return c;
    });
  }
  // Flores pequeñas estilo pokemon (procedurales, sobre transparente)
  function makeFlowerTile(petal, center){
    const c = document.createElement("canvas");
    c.width = TILE; c.height = TILE;
    const x = c.getContext("2d");
    const flower = (fx,fy) => {
      x.fillStyle = petal;
      x.fillRect(fx,fy-1,1,1); x.fillRect(fx,fy+1,1,1);
      x.fillRect(fx-1,fy,1,1); x.fillRect(fx+1,fy,1,1);
      x.fillStyle = center;
      x.fillRect(fx,fy,1,1);
    };
    flower(4,5); flower(11,10);
    return c;
  }
  async function loadAssets(){
    const CF = "assets/gfx/cute";
    const [ow, inn, cv, ch, np, kr, fb,
           kaWalkW, kaWalkE, kaRunW, kaRunE,
           cfGrass, cfWater, cfWaterM, cfPath, cfPathM, cfBeach,
           cfOak, cfHouse, cfBridge, cfFence, cfDecor, cfChest,
           cfChicken, cfCow, cfPig, cfSheep] = await Promise.all([
      loadImg("assets/gfx/Overworld.png"),
      loadImg("assets/gfx/Inner.png"),
      loadImg("assets/gfx/cave.png"),
      loadImg("assets/gfx/character.png"),
      loadImg("assets/gfx/NPC_test.png"),
      loadImg("assets/gfx/karol4.png"),
      loadImg("assets/gfx/floor_b.png"),
      loadImg("assets/gfx/karol_anim/walk_w.png"),
      loadImg("assets/gfx/karol_anim/walk_e.png"),
      loadImg("assets/gfx/karol_anim/run_w.png"),
      loadImg("assets/gfx/karol_anim/run_e.png"),
      loadImg(CF+"/Tiles/Grass_Middle.png"),
      loadImg(CF+"/Tiles/Water_Tile.png"),
      loadImg(CF+"/Tiles/Water_Middle.png"),
      loadImg(CF+"/Tiles/Path_Tile.png"),
      loadImg(CF+"/Tiles/Path_Middle.png"),
      loadImg(CF+"/Tiles/FarmLand_Tile.png"),
      loadImg(CF+"/Outdoor decoration/Oak_Tree.png"),
      loadImg(CF+"/Outdoor decoration/House_1_Wood_Base_Blue.png"),
      loadImg(CF+"/Outdoor decoration/Bridge_Wood.png"),
      loadImg(CF+"/Outdoor decoration/Fences.png"),
      loadImg(CF+"/Outdoor decoration/Outdoor_Decor_Free.png"),
      loadImg(CF+"/Outdoor decoration/Chest.png"),
      loadImg(CF+"/Animals/Chicken/Chicken.png"),
      loadImg(CF+"/Animals/Cow/Cow.png"),
      loadImg(CF+"/Animals/Pig/Pig.png"),
      loadImg(CF+"/Animals/Sheep/Sheep.png"),
    ]);
    imgs = {
      ow, "in": inn, cv, ch, np, kr, fb,
      kaWalkW, kaWalkE, kaRunW, kaRunE,
      cfg: cfGrass, cfw: cfWater, cfwm: cfWaterM,
      cfp: cfPath, cfpm: cfPathM, cfb: cfBeach,
      oak: cfOak, cfh: cfHouse, cfbr: cfBridge,
      cff: cfFence, cfd: cfDecor, cfch: cfChest,
      cfhB: makeTintedCanvas(cfHouse, [96,110,160], 0.30),   // casa variante fría (gimnasios "barn")
      cfhG: makeTintedCanvas(cfHouse, [230,180,90], 0.28),   // casa variante cálida (tienda/alcaldía)
      tg: makeTallGrassTile(),
      bsh: makeBushTile(),
      animals: {
        chicken: makeAnimalSheets(cfChicken),
        cow: makeAnimalSheets(cfCow),
        pig: makeAnimalSheets(cfPig),
        sheep: makeAnimalSheets(cfSheep),
      },
    };
    // --- Puentes de madera ---
    // sección sólida del puente vertical = fila 2 (rail | tabla | rail)
    const bridgeTile = (col) => {
      const c = document.createElement("canvas"); c.width=16; c.height=16;
      c.getContext("2d").drawImage(cfBridge, col*16, 2*16, 16, 16, 0, 0, 16, 16);
      return c;
    };
    imgs.bvL = bridgeTile(0);   // rail izquierdo
    imgs.bvM = bridgeTile(1);   // tabla central
    imgs.bvR = bridgeTile(2);   // rail derecho
    // versión horizontal = cada pieza rotada 90° (rail izq→arriba, rail der→abajo)
    const rot90 = (src) => {
      const c = document.createElement("canvas"); c.width=16; c.height=16;
      const g = c.getContext("2d");
      g.translate(16, 0); g.rotate(Math.PI/2);
      g.drawImage(src, 0, 0);
      return c;
    };
    imgs.bhT = rot90(imgs.bvL);  // rail superior
    imgs.bhM = rot90(imgs.bvM);  // tabla
    imgs.bhB = rot90(imgs.bvR);  // rail inferior
    butterflySprites = [
      makeButterflyFrames("#ff9f43"),
      makeButterflyFrames("#f8f4ff"),
      makeButterflyFrames("#ff70a6"),
      makeButterflyFrames("#7fd8ff"),
    ];
    ready = true;
  }

  // ---------- Animales de granja (ambiente) ----------
  let farmAnimals = [];
  function spawnAnimals(){
    farmAnimals = [];
    const put = (kind, x, y, r) => farmAnimals.push({
      kind, x, y, px:x*TILE, py:y*TILE, tx:x, ty:y,
      home:{x,y}, radius:r, moving:false, facing:1,
      frame:0, t: Math.random()*4000, next: performance.now()+1000+Math.random()*4000,
    });
    // dentro del corral del granjero
    put("cow", 44, 11, 2); put("pig", 46, 12, 2); put("chicken", 43, 12, 2); put("sheep", 46, 10, 2);
    // libres por la pradera
    put("sheep", 18, 26, 3); put("chicken", 26, 36, 3); put("cow", 12, 22, 3);
  }
  function updateAnimals(){
    if (mode!=="over") return;
    const now = performance.now();
    farmAnimals.forEach(a => {
      a.t++;
      if (a.moving){
        const gx=a.tx*TILE, gy=a.ty*TILE;
        a.px += Math.sign(gx-a.px)*0.6;
        a.py += Math.sign(gy-a.py)*0.6;
        if (a.t % 14 === 0) a.frame = (a.frame+1)%2;
        if (Math.abs(gx-a.px)<=0.8 && Math.abs(gy-a.py)<=0.8){
          a.px=gx; a.py=gy; a.x=a.tx; a.y=a.ty; a.moving=false; a.frame=0;
          a.next = now + 1500 + Math.random()*4500;
        }
        return;
      }
      if (now < a.next) return;
      a.next = now + 1500 + Math.random()*4500;
      const dirs = [[0,1],[0,-1],[-1,0],[1,0]];
      const [dx,dy] = dirs[Math.random()*4|0];
      const nx=a.x+dx, ny=a.y+dy;
      if (Math.abs(nx-a.home.x)>a.radius || Math.abs(ny-a.home.y)>a.radius) return;
      if (solid[ny]?.[nx] || meta[ny]?.[nx]) return;
      if (nx===player.x && ny===player.y) return;
      if (dx!==0) a.facing = dx>0 ? -1 : 1;
      a.tx=nx; a.ty=ny; a.moving=true;
    });
  }
  function drawAnimals(camX, camY){
    if (mode!=="over") return;
    farmAnimals.forEach(a => {
      const sheets = imgs.animals?.[a.kind];
      if (!sheets) return;
      const sheet = a.facing===1 ? sheets.L : sheets.R;
      const col = a.moving ? a.frame : 0;
      const fx = a.facing===1 ? col : 1-col; // hoja espejada invierte columnas
      ctx.drawImage(sheet, fx*32, 0, 32, 32,
        Math.round((a.px-8)*SCALE - camX), Math.round((a.py-16)*SCALE - camY),
        32*SCALE, 32*SCALE);
    });
  }

  // ---------- Mariposas (ambiente) ----------

  let butterflySprites = [];
  let butterflies = [];
  function spawnButterflies(){
    butterflies = [];
    const zones = [
      { x:8,  y:14, w:40, h:24, n:4 },  // pradera
      { x:8,  y:48, w:40, h:14, n:3 },  // costa
      { x:58, y:6,  w:32, h:24, n:2 },  // bosque
    ];
    zones.forEach(z => {
      for (let i=0;i<z.n;i++){
        const bx = (z.x + Math.random()*z.w) * TILE;
        const by = (z.y + Math.random()*z.h) * TILE;
        butterflies.push({
          px:bx, py:by, tx:bx, ty:by,
          zone:z, kind: Math.random()*butterflySprites.length|0,
          t: Math.random()*200,
        });
      }
    });
  }
  function updateButterflies(){
    if (mode!=="over") return;
    butterflies.forEach(b => {
      b.t++;
      const dx = b.tx-b.px, dy = b.ty-b.py;
      const d = Math.hypot(dx,dy);
      if (d < 3 || b.t > 400){
        b.t = 0;
        b.tx = (b.zone.x + Math.random()*b.zone.w) * TILE;
        b.ty = (b.zone.y + Math.random()*b.zone.h) * TILE;
      } else {
        b.px += dx/d * 0.55 + Math.sin(b.t*0.15)*0.25;
        b.py += dy/d * 0.55 + Math.cos(b.t*0.11)*0.2;
      }
    });
  }
  function drawButterflies(camX, camY){
    if (mode!=="over") return;
    butterflies.forEach(b => {
      const spr = butterflySprites[b.kind];
      if (!spr) return;
      const frame = (b.t>>3) & 1;
      ctx.drawImage(spr[frame],
        Math.round(b.px*SCALE - camX), Math.round(b.py*SCALE - camY),
        8*SCALE, 8*SCALE);
    });
  }

  // ---------- Palette swap (skins / NPC tints) ----------
  function hexToRgb(h){
    const m = h.replace("#","");
    const v = m.length===3 ? m.split("").map(c=>c+c).join("") : m;
    return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];
  }
  let playerSheet=null, playerSheetSkin=null;
  // Colores del pelo del sprite base (castaño) que se remapean
  const HAIR_FROM = [[106,72,52],[67,46,39]];
  // Paleta de "peinados" para NPCs y jugador
  const HAIRS = {
    red:   { main:[214,44,56],   shadow:[142,26,40] },
    black: { main:[45,42,48],    shadow:[26,24,30] },
    gray:  { main:[208,208,214], shadow:[152,152,160] },
    pink:  { main:[255,128,170], shadow:[198,78,122] },
    blond: { main:[238,198,92],  shadow:[188,148,62] },
    bald:  { main:[232,212,178], shadow:[191,167,135] }, // pelo color piel = calvo
  };
  // Construye una hoja de personaje con camisa (shirtHex) y pelo ({main,shadow,grow})
  function buildTintedSheet(img, shirtHex, hair){
    const c = document.createElement("canvas");
    c.width=img.width; c.height=img.height;
    const x = c.getContext("2d");
    x.drawImage(img,0,0);
    const d = x.getImageData(0,0,c.width,c.height);
    const p = d.data;
    const W2 = c.width;
    const target = shirtHex ? hexToRgb(shirtHex) : null;
    for (let i=0;i<p.length;i+=4){
      if (p[i+3]<128) continue;
      const r=p[i], g=p[i+1], b=p[i+2];
      if (hair){
        const hi = HAIR_FROM.findIndex(h => Math.abs(h[0]-r)<=4 && Math.abs(h[1]-g)<=4 && Math.abs(h[2]-b)<=4);
        if (hi >= 0){
          const to = hi===0 ? hair.main : hair.shadow;
          p[i]=to[0]; p[i+1]=to[1]; p[i+2]=to[2];
          continue;
        }
      }
      if (target && r>70 && r>g*1.45 && r>b*1.45){
        const luma = (r*0.5 + g*0.3 + b*0.2) / 160;
        p[i]=Math.min(255,target[0]*luma); p[i+1]=Math.min(255,target[1]*luma); p[i+2]=Math.min(255,target[2]*luma);
      }
    }
    // melena: el pelo "crece" hacia abajo por los lados de la silueta
    if (hair && hair.grow){
      const isHair = i => p[i+3]>128 &&
        [hair.main, hair.shadow].some(h => Math.abs(h[0]-p[i])<=4 && Math.abs(h[1]-p[i+1])<=4 && Math.abs(h[2]-p[i+2])<=4);
      const shadow = hair.shadow;
      const isSkin = i => p[i+3]>128 && p[i]>180 && p[i+1]>150 && p[i+2]>110;
      for (let pass=0; pass<6; pass++){
        const grow = [];
        for (let y=1;y<c.height;y++){
          const rowInFrame = y % 32;
          if (rowInFrame === 0 || rowInFrame > 17) continue; // hasta los hombros
          for (let xx=0;xx<W2;xx++){
            const i = (y*W2+xx)*4, up = ((y-1)*W2+xx)*4;
            if (!isHair(up)) continue;
            if (p[i+3]<128){ grow.push(i); continue; }
            if (pass < 3 && !isSkin(i) && !isHair(i)){
              const L = (y*W2+(xx-1))*4, R = (y*W2+(xx+1))*4;
              const edge = (xx===0 || p[L+3]<128) || (xx===W2-1 || p[R+3]<128);
              if (edge) grow.push(i);
            }
          }
        }
        grow.forEach(i => {
          p[i]=shadow[0]; p[i+1]=shadow[1]; p[i+2]=shadow[2]; p[i+3]=255;
        });
      }
    }
    x.putImageData(d,0,0);
    return c;
  }
  // Karol usa su propio spritesheet (arte personalizado)
  // fuente a 3x (72x96 por frame) para que se vea nítida; lógico 24x32
  const PF_W = 24, PF_H = 32;      // tamaño lógico en el mundo
  const PS_W = 72, PS_H = 96;      // tamaño de cada frame en la hoja
  function refreshPlayerSheet(){
    if (playerSheet) return;
    playerSheet = imgs.kr;
  }
  // NPCs con "skins": misma hoja del personaje, camisa y peinado propios
  const npcSheets = {};
  function npcSheet(npc){
    const key = npc.tint + "|" + (npc.hair||"brown") + (npc.long?"L":"");
    if (!npcSheets[key]){
      const hairDef = npc.hair && HAIRS[npc.hair] ? { ...HAIRS[npc.hair], grow: !!npc.long } : null;
      npcSheets[key] = buildTintedSheet(imgs.ch, npc.tint, hairDef);
    }
    return npcSheets[key];
  }

  // ---------- Dialogue ----------
  const Dialog = { open:false, npc:null, idx:0 };
  function openDialog(npc){
    Dialog.open=true; Dialog.npc=npc; Dialog.idx=0;
    npc.dir = player.x < npc.x ? 1 : (player.x > npc.x ? 3 : (player.y > npc.y ? 0 : 2));
    Sfx.play("blip");
    if (npc.key) Quests.notify("talk", npc.key);
    // la alcaldesa siempre describe la misión vigente
    if (npc.key === "alcalde"){
      const q = Quests.current();
      npc.lines = [
        { ko:"어서 오세요! 저는 시장이에요.", rom:"eoseo oseyo! jeoneun sijang-ieyo.", es:"¡Bienvenida! Yo soy la alcaldesa." },
        q ? { ko:"당신의 임무예요!", rom:"dangsinui immuyeyo!", es:`Tu misión (Cap. ${q.cap}): ${q.title} — ${q.desc}` }
          : { ko:"당신은 진정한 마스터예요!", rom:"dangsineun jinjeonghan maseuteoyeyo!", es:"¡Ya eres una verdadera maestra del coreano!" },
        { ko:"화이팅!", rom:"hwaiting!", es:"¡Ánimo!" },
      ];
    }
    renderDialog();
  }
  function advanceDialog(){
    if (!Dialog.open) return;
    Dialog.idx++;
    if (Dialog.idx >= Dialog.npc.lines.length){
      const npc = Dialog.npc;
      closeDialog();
      if (npc.isLeaderOf){ exitMap(); UI.startGymFromWorld(npc.isLeaderOf); }
      else if (npc.isShop || npc.action==="shop") UI.openShop();
      else if (npc.action==="cafe") UI.startCafe();
      else if (npc.action==="class") UI.startClass();
      else if (npc.action==="karaoke") UI.startKaraoke();
      else if (npc.action==="duel") UI.startDuel();
      return;
    }
    Sfx.play("blip");
    renderDialog();
  }
  function closeDialog(){
    Dialog.open=false; Dialog.npc=null;
    const el = document.getElementById("dialog");
    if (el) el.hidden = true;
  }
  function renderDialog(){
    const el = document.getElementById("dialog");
    const line = Dialog.npc.lines[Dialog.idx];
    el.hidden = false;
    el.querySelector(".dlg-name").textContent = Dialog.npc.name;
    el.querySelector(".dlg-ko").textContent = line.ko;
    el.querySelector(".dlg-rom").textContent = line.rom;
    el.querySelector(".dlg-es").textContent = line.es;
    el.querySelector(".dlg-more").textContent =
      Dialog.idx < Dialog.npc.lines.length-1 ? "▼ espacio / clic"
      : (Dialog.npc.isLeaderOf ? "⚔ ¡empezar examen!"
        : (Dialog.npc.actionLabel || (Dialog.npc.isShop ? "🛒 abrir tienda" : "✕ cerrar")));
    Engine.speak(line.ko);
  }

  // ---------- Player ----------
  const player = {
    x:30, y:21, px:30*TILE, py:21*TILE,
    dir:0, frame:0, animT:0,
    moving:false, tx:30, ty:21, speed:1.5,
  };
  const keys = {};
  let started = false;

  // ---------- Mascota que te sigue ----------
  let pet = null;
  const petImgCache = {};
  function petImg(key){
    if (!petImgCache[key]){
      const img = new Image();
      img.src = "data:image/svg+xml;utf8," + encodeURIComponent(Creatures.petSprite(key));
      petImgCache[key] = img;
    }
    return petImgCache[key];
  }
  function refreshPet(){
    const k = State.get().activePet;
    if (!k){ pet = null; return; }
    if (pet && pet.key === k) return;
    pet = { key:k, x:player.x, y:player.y, px:player.px, py:player.py,
            tx:player.x, ty:player.y, moving:false, bob:0 };
  }
  function petTeleport(){
    if (!pet) return;
    pet.x=pet.tx=player.x; pet.y=pet.ty=player.y;
    pet.px=player.px; pet.py=player.py;
    pet.moving=false;
  }
  function petFollowTo(x,y){
    if (!pet) return;
    if (pet.x===x && pet.y===y && !pet.moving) return;
    pet.tx=x; pet.ty=y; pet.moving=true;
  }
  function updatePet(){
    refreshPet();
    if (!pet) return;
    pet.bob++;
    if (pet.moving){
      const gx=pet.tx*TILE, gy=pet.ty*TILE;
      pet.px += Math.sign(gx-pet.px)*player.speed;
      pet.py += Math.sign(gy-pet.py)*player.speed;
      if (Math.abs(gx-pet.px)<=player.speed && Math.abs(gy-pet.py)<=player.speed){
        pet.px=gx; pet.py=gy; pet.x=pet.tx; pet.y=pet.ty; pet.moving=false;
      }
    }
  }

  function isActive(){
    const scr = document.getElementById("screen-map");
    return scr && scr.classList.contains("active");
  }

  function tryMove(dx,dy,dir){
    if (player.moving || Dialog.open) return;
    player.dir = dir;
    const nx=player.x+dx, ny=player.y+dy;
    if (nx<0||ny<0||nx>=MW||ny>=MH) return;
    const m = meta[ny][nx];
    if (m && m.type==="npc"){ openDialog(m.npc); return; }
    if (solid[ny][nx]) return;
    petFollowTo(player.x, player.y); // la mascota va a la casilla que dejas
    player.tx=nx; player.ty=ny; player.moving=true;
  }

  function onArrive(){
    const s = State.get();
    if (mode==="over") s.playerPos = { x:player.x, y:player.y };
    const m = meta[player.y][player.x];
    if (!m) return;
    if (m.type==="grass"){
      // spawn reducido: la hierba alta da batallas de palabras solo a veces
      if (Math.random() < 0.08){
        Sfx.play("encounter");
        const word = Engine.pickEncounter(m.pool);
        UI.startWildBattleWord(word);
      }
    } else if (m.type==="bush"){
      // arbustos estilo pokemon: aquí viven los guardianes
      if (Math.random() < 0.35){
        UI.startCaptureFromWorld(m.biome);
      }
    } else if (m.type==="cavedoor"){
      enterCave();
    } else if (m.type==="shopdoor"){
      enterShop();
    } else if (m.type==="pueblodoor"){
      enterPueblo();
    } else if (m.type==="alcaldiadoor"){
      enterAlcaldia();
    } else if (m.type==="abuelacasadoor"){
      enterAbuelaCasa();
    } else if (m.type==="cafedoor"){
      enterCafe();
    } else if (m.type==="academiadoor"){
      enterAcademia();
    } else if (m.type==="norebangdoor"){
      enterNorebang();
    } else if (m.type==="casadoor"){
      enterHome();
    } else if (m.type==="save"){
      State.save();
      Sfx.play("ok");
      UI.toast("💾 Partida guardada en casa.");
    } else if (m.type==="chest"){
      const sc = State.get();
      sc.chests = sc.chests || [];
      if (!sc.chests.includes(m.id)){
        sc.chests.push(m.id);
        State.addCoins(30);
        State.save();
        Sfx.play("coin");
        UI.toast("🎁 ¡Cofre encontrado! +30 monedas");
        UI.refreshTopbar();
      }
      ground[player.y][player.x] = "grass";
      meta[player.y][player.x] = null;
    } else if (m.type==="fishspot"){
      UI.startFishing();
    } else if (m.type==="gymdoor"){
      const g = Data.gyms.find(x=>x.key===m.key);
      if (s.badges.includes(g.key)) { UI.toast("Ya tienes esta medalla. 🏆"); stepBack(); return; }
      // modo historia: el gimnasio se abre con la misión + nivel mínimo
      if (!Quests.isGymUnlocked(g.key)){
        UI.toast(`🔒 Completa las misiones para abrir este gimnasio. (Habla con la alcaldesa)`, 2600);
        stepBack();
        return;
      }
      const lvlReq = Quests.gymLevelReq(g.key);
      if (Quests.level() < lvlReq){
        UI.toast(`🔒 Necesitas nivel ${lvlReq} (tienes ${Quests.level()}). ¡Estudia más palabras!`, 2600);
        stepBack();
        return;
      }
      enterInterior(g);
    } else if (m.type==="exit"){
      exitMap();
    }
  }
  function stepBack(){
    if (!solid[player.y+1]?.[player.x]){
      player.ty=player.y+1; player.tx=player.x; player.moving=true; player.dir=0;
    }
  }

  // ---------- NPC wandering ----------
  function updateNpcs(now){
    if (mode!=="over") return;
    npcsCur.forEach(n => {
      if (n.moving){
        const gx=n.tx*TILE, gy=n.ty*TILE;
        n.px += Math.sign(gx-n.px)*1.1;
        n.py += Math.sign(gy-n.py)*1.1;
        n.animT++;
        if (n.animT%10===0) n.frame=(n.frame+1)%4;
        if (Math.abs(gx-n.px)<=1.2 && Math.abs(gy-n.py)<=1.2){
          n.px=gx; n.py=gy; n.x=n.tx; n.y=n.ty; n.moving=false; n.frame=0;
          n.nextWander = now + 1800 + Math.random()*3500;
        }
        return;
      }
      if (!n.wander || Dialog.npc===n || now < n.nextWander) return;
      n.nextWander = now + 1800 + Math.random()*3500;
      const dirs = [[0,1,0],[-1,0,1],[0,-1,2],[1,0,3]];
      const [dx,dy,dir] = dirs[Math.random()*4|0];
      const nx=n.x+dx, ny=n.y+dy;
      if (nx<0||ny<0||nx>=MW||ny>=MH) return;
      if (Math.abs(nx-n.home.x)>2 || Math.abs(ny-n.home.y)>2) return;
      if (solid[ny][nx] || meta[ny][nx]) return;
      if (nx===player.x && ny===player.y) return;
      if (nx===player.tx && ny===player.ty) return;
      // move: update grid refs
      solid[n.y][n.x]=false; meta[n.y][n.x]=null;
      solid[ny][nx]=true; meta[ny][nx]={type:"npc",npc:n};
      n.dir=dir; n.tx=nx; n.ty=ny; n.moving=true;
    });
  }

  function update(){
    updateNpcs(performance.now());
    updateButterflies();
    updateAnimals();
    updatePet();
    if (Dialog.open){ player.frame=0; return; }
    if (!player.moving){
      if (keys["ArrowUp"]||keys["w"]) tryMove(0,-1,2);
      else if (keys["ArrowDown"]||keys["s"]) tryMove(0,1,0);
      else if (keys["ArrowLeft"]||keys["a"]) tryMove(-1,0,1);
      else if (keys["ArrowRight"]||keys["d"]) tryMove(1,0,3);
      else { player.frame=0; }
    }
    if (player.moving){
      // sprint con Shift (corre con su animación propia)
      player.sprint = !!keys["Shift"];
      const spd = player.sprint ? 2.6 : player.speed;
      const gx=player.tx*TILE, gy=player.ty*TILE;
      player.px += Math.sign(gx-player.px)*spd;
      player.py += Math.sign(gy-player.py)*spd;
      player.animT++;
      if (player.animT%8===0) player.frame=(player.frame+1)%4;
      if (Math.abs(gx-player.px)<=spd && Math.abs(gy-player.py)<=spd){
        player.px=gx; player.py=gy;
        player.x=player.tx; player.y=player.ty;
        player.moving=false;
        onArrive();
      }
    }
  }

  // ---------- Render ----------
  let canvas, ctx;
  function draw(){
    if (!canvas) return;
    refreshPlayerSheet();
    const vw=canvas.width, vh=canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0d0f1a";
    ctx.fillRect(0,0,vw,vh);

    const worldW = MW*TILE*SCALE, worldH = MH*TILE*SCALE;
    const camX = worldW<=vw ? -(vw-worldW)/2 : Math.max(0, Math.min(player.px*SCALE - vw/2, worldW-vw));
    const camY = worldH<=vh ? -(vh-worldH)/2 : Math.max(0, Math.min(player.py*SCALE - vh/2, worldH-vh));

    const x0=Math.max(0,Math.floor(camX/(TILE*SCALE)));
    const y0=Math.max(0,Math.floor(camY/(TILE*SCALE)));
    const x1=Math.min(MW, x0+Math.ceil(vw/(TILE*SCALE))+2);
    const y1=Math.min(MH, y0+Math.ceil(vh/(TILE*SCALE))+2);

    for (let y=y0;y<y1;y++)
      for (let x=Math.max(0,x0);x<x1;x++)
        drawTile(ground[y][x], x, y, camX, camY);

    const sprites = [];
    for (let y=0;y<MH;y++) for (let x=0;x<MW;x++){
      const d = decor[y][x];
      if (d){ const def=DECOR[d.sprite]; sprites.push({base:(y+def.h)*TILE, kind:"decor", d, def, x, y}); }
    }
    npcsCur.forEach(n => sprites.push({ base:n.py+TILE, kind:"npc", n }));
    if (pet) sprites.push({ base:pet.py+TILE-1, kind:"pet" });
    sprites.push({ base:player.py+TILE, kind:"player" });
    sprites.sort((a,b)=>a.base-b.base);

    sprites.forEach(s => {
      if (s.kind==="decor"){
        const def = s.def;
        ctx.drawImage(imgs[def.i],
          def.x*TILE, def.y*TILE, def.w*TILE, def.h*TILE,
          Math.round(s.x*TILE*SCALE-camX), Math.round(s.y*TILE*SCALE-camY),
          def.w*TILE*SCALE, def.h*TILE*SCALE);
        if (s.d.gym) drawGymLabel(s.d, def, s.x, s.y, camX, camY);
        else if (s.d.shop) drawTextLabel("상점 🛒", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#9ef3b1");
        else if (s.d.alcaldia) drawTextLabel("시청 🏛", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#ffd166");
        else if (s.d.pueblo) drawTextLabel("마을 Pueblo", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#8ecae6");
        else if (s.d.casa) drawTextLabel("집 Casa", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#ff9fb0");
        else if (s.d.cafe) drawTextLabel("카페 ☕", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#e8c49a");
        else if (s.d.academia) drawTextLabel("학원 📚", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#a9d6ff");
        else if (s.d.norebang) drawTextLabel("노래방 🎤", (s.x+def.w/2)*TILE*SCALE-camX, s.y*TILE*SCALE-camY-8, "#ff9fd0");
      } else if (s.kind==="npc"){
        const n = s.n;
        const frame = n.moving ? n.frame : 0;
        ctx.drawImage(npcSheet(n),
          frame*16, DIR_ROW[n.dir]*32, 16, 32,
          Math.round(n.px*SCALE-camX), Math.round((n.py-TILE)*SCALE-camY),
          16*SCALE, 32*SCALE);
        drawBubble(n, camX, camY);
      } else if (s.kind === "pet"){
        const img = petImg(pet.key);
        if (img.complete && img.naturalWidth){
          const hop = pet.moving ? Math.abs(Math.sin(pet.bob*0.3))*2.5*SCALE : 0;
          ctx.drawImage(img,
            Math.round(pet.px*SCALE-camX), Math.round(pet.py*SCALE-camY-hop),
            16*SCALE, 16*SCALE);
        }
      } else {
        const lateral = (player.dir===1 || player.dir===3);
        const sideStrip = lateral
          ? imgs[((player.moving && player.sprint) ? "kaRun" : "kaWalk") + (player.dir===1 ? "W" : "E")]
          : null;
        if (lateral && sideStrip && sideStrip.naturalWidth){
          // lateral: siempre la tira animada (quieta = frame de pie, sin saltos de tamaño)
          const fr = player.moving
            ? Math.floor(player.animT / (player.sprint ? 4 : 6)) % 8
            : 6; // frame de pie
          ctx.drawImage(sideStrip,
            fr*96, 0, 96, 96,
            Math.round((player.px - 8)*SCALE - camX),
            Math.round((player.py - TILE)*SCALE - camY),
            96, 96);
        } else {
          const frame = player.moving ? player.frame : 0;
          ctx.drawImage(playerSheet,
            frame*PS_W, DIR_ROW[player.dir]*PS_H, PS_W, PS_H,
            Math.round((player.px - (PF_W-TILE)/2)*SCALE - camX),
            Math.round((player.py-TILE)*SCALE - camY),
            PF_W*SCALE, PF_H*SCALE);
        }
      }
    });

    drawAnimals(camX, camY);
    drawButterflies(camX, camY);
  }

  function drawBubble(n, camX, camY){
    if (Dialog.npc===n) return;
    const bx = n.px*SCALE - camX + 8*SCALE;
    const by = (n.py-TILE)*SCALE - camY - 6*SCALE;
    ctx.fillStyle="#fff";
    ctx.fillRect(bx-5*SCALE, by, 10*SCALE, 5*SCALE);
    ctx.fillStyle="#000";
    ctx.font=`bold ${4*SCALE}px monospace`;
    ctx.textAlign="center";
    ctx.fillText("...", bx, by+3.6*SCALE);
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.moveTo(bx-2*SCALE, by+5*SCALE);
    ctx.lineTo(bx+2*SCALE, by+5*SCALE);
    ctx.lineTo(bx, by+7*SCALE);
    ctx.closePath();
    ctx.fill();
  }

  function drawTextLabel(label, cx, cy, color){
    ctx.font = `bold ${7*SCALE}px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,.55)";
    const tw = ctx.measureText(label).width;
    ctx.fillRect(cx-tw/2-6, cy-8*SCALE, tw+12, 9*SCALE);
    ctx.fillStyle = color || "#fff";
    ctx.fillText(label, cx, cy);
  }

  function drawGymLabel(d, def, x, y, camX, camY){
    const g = Data.gyms.find(k=>k.key===d.gym);
    const s = State.get();
    const cleared = s.badges.includes(g.key);
    const locked = !Quests.isGymUnlocked(g.key) || Quests.level() < Quests.gymLevelReq(g.key);
    const cx = (x + def.w/2)*TILE*SCALE - camX;
    const cy = y*TILE*SCALE - camY - 8;
    ctx.font = `bold ${7*SCALE}px monospace`;
    ctx.textAlign = "center";
    const label = cleared ? "🏆" : (locked ? "🔒 "+g.icon : g.icon);
    ctx.fillStyle = "rgba(0,0,0,.55)";
    const tw = ctx.measureText(label).width;
    ctx.fillRect(cx-tw/2-6, cy-8*SCALE, tw+12, 9*SCALE);
    ctx.fillStyle = cleared ? "#ffd166" : "#fff";
    ctx.fillText(label, cx, cy);
  }

  // auto-tiling: elige la variante con borde según los vecinos
  const WATERISH = n => n===undefined || n==="water" || (typeof n==="string" && (n.indexOf("bri")===0 || n.indexOf("pier")===0));
  function autoTileName(name, x, y){
    if (name === "water"){
      const like = (xx,yy) => WATERISH(ground[yy]?.[xx]);
      const N=like(x,y-1), S=like(x,y+1), W=like(x-1,y), E=like(x+1,y);
      if (!N) return !W ? "waterTL" : (!E ? "waterTR" : "waterT");
      if (!S) return !W ? "waterBL" : (!E ? "waterBR" : "waterB");
      if (!W) return "waterL";
      if (!E) return "waterR";
      return "water";
    }
    if (name === "sand"){
      const like = (xx,yy) => { const g = ground[yy]?.[xx]; return g===undefined || g==="sand" || g==="bushSand" || g==="path" || WATERISH(g); };
      const N=like(x,y-1), S=like(x,y+1), W=like(x-1,y), E=like(x+1,y);
      if (!N) return !W ? "sandTL" : (!E ? "sandTR" : "sandT");
      if (!S) return !W ? "sandBL" : (!E ? "sandBR" : "sandB");
      if (!W) return "sandL";
      if (!E) return "sandR";
      return "sand";
    }
    if (name === "path"){
      const like = (xx,yy) => { const g = ground[yy]?.[xx]; return g===undefined || g==="path" || g==="sand" || WATERISH(g); };
      const N=like(x,y-1), S=like(x,y+1), W=like(x-1,y), E=like(x+1,y);
      if (!N) return !W ? "pathTL" : (!E ? "pathTR" : "pathT");
      if (!S) return !W ? "pathBL" : (!E ? "pathBR" : "pathB");
      if (!W) return "pathL";
      if (!E) return "pathR";
      return "path";
    }
    return name;
  }

  function drawTile(name, x, y, camX, camY){
    const t = TILES[autoTileName(name, x, y)] || TILES.grass;
    const dx=Math.round(x*TILE*SCALE-camX), dy=Math.round(y*TILE*SCALE-camY);
    if (t.base){
      const b = TILES.grass;
      ctx.drawImage(imgs[b.i], b.x*TILE, b.y*TILE, TILE, TILE, dx, dy, TILE*SCALE, TILE*SCALE);
    } else if (t.baseSand){
      const b = TILES.sand;
      ctx.drawImage(imgs[b.i], b.x*TILE, b.y*TILE, TILE, TILE, dx, dy, TILE*SCALE, TILE*SCALE);
    } else if (t.baseWater){
      const b = TILES.water;
      ctx.drawImage(imgs[b.i], b.x*TILE, b.y*TILE, TILE, TILE, dx, dy, TILE*SCALE, TILE*SCALE);
    } else if (t.baseFloor){
      const b = TILES.floorA;
      ctx.drawImage(imgs[b.i], b.x*TILE, b.y*TILE, TILE, TILE, dx, dy, TILE*SCALE, TILE*SCALE);
    }
    ctx.drawImage(imgs[t.i], t.x*TILE, t.y*TILE, TILE, TILE, dx, dy, TILE*SCALE, TILE*SCALE);
  }

  let lastTick = 0;
  function tick(){
    if (!isActive() || !ready) return;
    const wrap = canvas.parentElement;
    if (canvas.width !== wrap.clientWidth || canvas.height !== wrap.clientHeight) resize();
    // frame-rate independent: catch up missed steps (e.g. throttled hidden tab)
    const now = performance.now();
    const steps = lastTick ? Math.min(30, Math.max(1, Math.round((now-lastTick)/16.7))) : 1;
    lastTick = now;
    for (let i=0;i<steps;i++) update();
    draw();
  }
  function loop(){
    requestAnimationFrame(loop);
    tick();
  }

  function resize(){
    if (!canvas) return;
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
  }

  async function start(){
    if (started){ resize(); return; }
    started = true;
    canvas = document.getElementById("world-canvas");
    ctx = canvas.getContext("2d");
    buildOverworld();
    await loadAssets();

    const pos = State.get().playerPos;
    if (pos && !solid[pos.y]?.[pos.x] && !(meta[pos.y]?.[pos.x]||{}).type){
      player.x=player.tx=pos.x; player.y=player.ty=pos.y;
      player.px=pos.x*TILE; player.py=pos.y*TILE;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", e => {
      if (!isActive()) return;
      if (Dialog.open && (e.key===" "||e.key==="Enter"||e.key==="Escape")){
        e.preventDefault();
        if (e.key==="Escape") closeDialog(); else advanceDialog();
        return;
      }
      keys[e.key]=true;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    });
    window.addEventListener("keyup", e => { keys[e.key]=false; });
    document.getElementById("dialog").addEventListener("click", advanceDialog);
const padKey = { up:"ArrowUp", down:"ArrowDown", left:"ArrowLeft", right:"ArrowRight" };

document.querySelectorAll("[data-pad]").forEach(b => {
  const k = padKey[b.dataset.pad];

  const on = (e) => {
    // Es vital revisar si es cancelable para que no arroje errores en consola
    if (e.cancelable) e.preventDefault(); 
    if (Dialog.open) {
      advanceDialog();
      return;
    }
    keys[k] = true;
  };

  const off = (e) => {
    if (e.cancelable) e.preventDefault();
    keys[k] = false;
  };

  // Eventos para móvil/táctil
  b.addEventListener("touchstart", on, { passive: false });
  b.addEventListener("touchend", off, { passive: false });
  b.addEventListener("touchcancel", off, { passive: false });

  // Eventos para PC/Ratón
  b.addEventListener("mousedown", on);
  b.addEventListener("mouseup", off);
  b.addEventListener("mouseleave", off);
});
// si el dispositivo tiene pantalla táctil, mostrar el D-pad siempre
if (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
  document.getElementById("dpad")?.classList.add("touch");
    loop();
    setInterval(() => { if (document.hidden) tick(); }, 50);
    UI.refreshTopbar(); // ya con assets: avatar de Karol en la barra
  }
  // Frame del sprite de Karol como data-URL (row: 0=frente, 2=arriba) para UI de batalla/topbar
  function playerFrameURL(row=2){
    if (!ready || !imgs.kr) return null;
    refreshPlayerSheet();
    if (!playerSheet) return null;
    const c = document.createElement("canvas");
    c.width = PS_W; c.height = PS_H;
    c.getContext("2d").drawImage(playerSheet, 0, row*PS_H, PS_W, PS_H, 0, 0, PS_W, PS_H);
    return c.toDataURL();
  }

  function debug(){
    return {
      mode,
      player: { x:player.x, y:player.y, moving:player.moving, dir:player.dir },
      keys: Object.keys(keys).filter(k=>keys[k]),
      ready, started, dialogOpen: Dialog.open,
      npcs: npcsCur.map(n=>({name:n.name.split(" ")[0], x:n.x, y:n.y, moving:n.moving})),
    };
  }

  // teleport (debug/trucos)
  function tp(x,y){
    if (solid[y]?.[x]) return false;
    player.x=player.tx=x; player.y=player.ty=y;
    player.px=x*TILE; player.py=y*TILE;
    player.moving=false;
    petTeleport();
    return true;
  }

  return { start, debug, playerFrameURL, tp };
})();
