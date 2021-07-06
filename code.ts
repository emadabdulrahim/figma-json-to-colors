// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".

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
  height: 500,
})

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-rectangles") {
    const nodes: SceneNode[] = []
    const size = 300
    for (let i = 0; i < msg.count; i++) {
      // const rect = figma.createRectangle()
      const rect = figma.createFrame()
      rect.x = i * (size + 20)
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }]
      rect.resize(size, 100)
      rect.cornerSmoothing = 0
      rect.cornerRadius = 10
      figma.currentPage.appendChild(rect)
      const component = figma.createComponent()
      component.appendChild(rect)
      component.resize(size, 100)
      nodes.push(component)
    }
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }

  function createText({ text }) {
    const textNode = figma.createText()
    textNode.characters = text

    return textNode
  }

  function createRect({ width, height, color, value, title }: any) {
    const container = figma.createFrame()
    const infoFrame = figma.createFrame()
    container.layoutMode = "VERTICAL"
    container.clipsContent = false
    const rect = figma.createRectangle()
    rect.resize(width, height)
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
    infoFrame.layoutMode = "HORIZONTAL"
    infoFrame.paddingLeft = 8
    infoFrame.paddingRight = 8
    infoFrame.paddingBottom = 8
    infoFrame.paddingTop = 8
    infoFrame.primaryAxisAlignItems = "SPACE_BETWEEN"
    infoFrame.counterAxisSizingMode = "AUTO"
    infoFrame.appendChild(createText({ text: title }))
    infoFrame.appendChild(createText({ text: value }))
    container.appendChild(rect)
    container.appendChild(infoFrame)
    container.resize(width, container.height)
    infoFrame.resize(container.width, infoFrame.height)
    return container
  }

  if (msg.type === "generate-palette") {
    const nodes: SceneNode[] = []
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
    const frame = figma.createFrame()
    frame.layoutMode = "VERTICAL"
    frame.itemSpacing = 40
    frame.fills = []
    const height = 150

    try {
      const palette = JSON.parse(msg.payload)
      const isArray = Array.isArray(palette)
      Object.keys(palette).forEach((key, index) => {
        const color = palette[key]
        const colorName = isArray ? `Shade${index + 1}` : key

        const shade = createRect({
          width: height * 2,
          height,
          title: colorName,
          value: color,
          color: hexToRGB(color),
        })
        frame.appendChild(shade)
      })
    } catch (e) {
      console.error(e)
    }
    frame.resize(height * 2, frame.height)

    nodes.push(frame)
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin()
}