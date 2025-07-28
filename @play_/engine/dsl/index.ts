`
circle fragmentShader position:(300,300) radius:40 label:"片段著色器" animation:popup
box sceneData position:(100,300) size:(80,40) label:"3D場景數據" animation:appear
circle lightSource position:(100,400) radius:30 label:"光源" animation:appear
circle shadow position:(100,200) radius:30 label:"陰影" animation:appear
circle lightColor position:(100,100) radius:30 label:"光顏色" animation:appear
box pixelColor position:(500,300) size:(80,40) label:"最終像素顏色" animation:fadein

arrow sceneData -> fragmentShader
arrow lightSource -> fragmentShader
arrow shadow -> fragmentShader
arrow lightColor -> fragmentShader
arrow fragmentShader -> pixelColor
`

const regx = /^$/;

function parse(dsl: string) {
  const lines = dsl.split('\n');
  for (const line of lines) {
    
  }
}