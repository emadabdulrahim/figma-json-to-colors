// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".

const SWATCH_WIDTH = 150
const SWATCH_HEIGHT = 100

const SWATCH_FRAME_PADDING = 12
const SWATCH_FRAME_WIDTH = SWATCH_WIDTH + SWATCH_FRAME_PADDING * 2
const SWATCH_FRAME_HEIGHT = SWATCH_HEIGHT + 40 + SWATCH_FRAME_PADDING * 2

const createSwatchFrame = () => {
  const frame = figma.createFrame()
  setPadding(frame, SWATCH_FRAME_PADDING)

  frame.cornerRadius = 4
  frame.cornerSmoothing = 1
  frame.itemSpacing = 12
  frame.layoutMode = "VERTICAL"
  frame.clipsContent = false

  return frame
}

const createTextFrame = () => {
  const frame = figma.createFrame()
  frame.layoutMode = "HORIZONTAL"
  frame.counterAxisSizingMode = "AUTO"
  frame.primaryAxisAlignItems = "SPACE_BETWEEN"
  frame.counterAxisAlignItems = "CENTER"

  return frame
}

const createColorValueFrame = () => {
  const frame = figma.createFrame()
  setPadding(frame, 4)

  frame.cornerRadius = 2
  frame.cornerSmoothing = 1
  frame.fills = [
    {
      type: "SOLID",
      color: { r: 248 / 255, g: 249 / 255, b: 250 / 255 },
    },
  ]

  frame.layoutMode = "HORIZONTAL"
  frame.counterAxisSizingMode = "AUTO"

  return frame
}

const setPadding = (node, padding) => {
  node.paddingLeft = padding
  node.paddingRight = padding
  node.paddingTop = padding
  node.paddingBottom = padding
}

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0

  // 3 digits
  if (h.length == 4) {
    r = parseInt(h[1] + h[1], 16)
    g = parseInt(h[2] + h[2], 16)
    b = parseInt(h[3] + h[3], 16)

    // 6 digits
  } else if (h.length == 7) {
    r = parseInt(h[1] + h[2], 16)
    g = parseInt(h[3] + h[4], 16)
    b = parseInt(h[5] + h[6], 16)
  }

  return {
    r,
    g,
    b,
  }
}

figma.showUI(__html__, {
  width: 500,
  height: 550,
})

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  function createText({ text }) {
    const textNode = figma.createText()
    textNode.characters = text

    return textNode
  }

  function createSwatch({ width, height, color, value, title }: any) {
    const swatchFrame = createSwatchFrame()
    const textFrame = createTextFrame()
    const colorValueFrame = createColorValueFrame()

    const rect = figma.createRectangle()
    rect.cornerRadius = 2
    rect.cornerSmoothing = 1
    rect.fills = [
      {
        type: "SOLID",
        color: { r: color.r / 255, g: color.g / 255, b: color.b / 255 },
      },
    ]
    rect.effects = [
      ...rect.effects,
      {
        type: "INNER_SHADOW",
        color: { r: 0 / 255, g: 0 / 255, b: 0 / 255, a: 0.1 },
        blendMode: "NORMAL",
        offset: { x: 0, y: 0 },
        radius: 0,
        visible: true,
        spread: 1,
      },
    ]

    rect.resize(width, height)

    const valueText = createText({ text: value })
    valueText.fontName = { family: "Monaco", style: "Regular" }
    valueText.fills = [
      {
        type: "SOLID",
        color: { r: 104 / 255, g: 112 / 255, b: 118 / 255 },
      },
    ]
    colorValueFrame.appendChild(valueText)

    textFrame.appendChild(createText({ text: title }))
    textFrame.appendChild(colorValueFrame)

    swatchFrame.appendChild(rect)
    swatchFrame.appendChild(textFrame)
    swatchFrame.resize(SWATCH_FRAME_WIDTH, swatchFrame.height)

    textFrame.resize(width, textFrame.height)
    return swatchFrame
  }

  if (msg.type === "generate-palette") {
    const nodes: SceneNode[] = []
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
    await figma.loadFontAsync({ family: "Monaco", style: "Regular" })
    const frame = figma.createFrame()
    frame.layoutMode = "HORIZONTAL"
    frame.itemSpacing = 12
    frame.fills = []

    try {
      const payload = JSON.parse(msg.payload)

      const colors =
        typeof payload.colors === "string"
          ? JSON.parse(payload.colors)
          : payload.colors

      const isArray = Array.isArray(colors)
      Object.keys(colors).forEach((key, index) => {
        const color = colors[key]
        const name = payload.name || "Shade"
        const colorName = isArray ? `${name}${index + 1}` : key

        const swatch = createSwatch({
          width: SWATCH_WIDTH,
          height: SWATCH_HEIGHT,
          title: colorName,
          value: color,
          color: hexToRGB(color),
        })
        frame.appendChild(swatch)
      })
    } catch (e) {
      console.error(e)
    }
    frame.resize(frame.width, SWATCH_FRAME_HEIGHT)

    nodes.push(frame)
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin()
}
