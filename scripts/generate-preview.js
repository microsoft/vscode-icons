const fs = require("fs");
const util = require("util");
const SVGO = require("svgo");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);
const writefile = util.promisify(fs.writeFile);

const svgo = new SVGO({
  plugins: [
    {
      cleanupAttrs: true
    },
    {
      removeDoctype: true
    },
    {
      removeXMLProcInst: true
    },
    {
      removeComments: true
    },
    {
      removeMetadata: true
    },
    {
      removeTitle: true
    },
    {
      removeDesc: true
    },
    {
      removeUselessDefs: true
    },
    {
      removeEditorsNSData: true
    },
    {
      removeEmptyAttrs: true
    },
    {
      removeHiddenElems: true
    },
    {
      removeEmptyText: true
    },
    {
      removeEmptyContainers: true
    },
    {
      removeViewBox: false
    },
    {
      cleanupEnableBackground: true
    },
    {
      convertStyleToAttrs: true
    },
    {
      convertColors: true
    },
    {
      convertPathData: true
    },
    {
      convertTransform: true
    },
    {
      removeUnknownsAndDefaults: true
    },
    {
      removeNonInheritableGroupAttrs: true
    },
    {
      removeUselessStrokeAndFill: true
    },
    {
      removeUnusedNS: true
    },
    {
      cleanupIDs: true
    },
    {
      cleanupNumericValues: true
    },
    {
      moveElemsAttrsToGroup: true
    },
    {
      moveGroupAttrsToElems: true
    },
    {
      collapseGroups: true
    },
    {
      removeRasterImages: false
    },
    {
      mergePaths: true
    },
    {
      convertShapeToPath: true
    },
    {
      sortAttrs: true
    },
    {
      removeDimensions: false
    },
    {
      removeAttrs: false
    }
  ]
});

const renderPage = (body) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/Primer/11.0.0/build.css"
      integrity="sha256-d3bIRbSj+/TzEHTXOEZzjVwB+CVSPzo1vv9MTTa1tHk="
      crossorigin="anonymous"
    />
    <title>VSCode Icons preview</title>
  </head>
  <body>
    <article class="markdown-body entry-content p-3 p-md-6" itemprop="text">
      <h1>
        <a
          id="user-content-visual-studio-code---icons"
          class="anchor"
          aria-hidden="true"
          href="#visual-studio-code---icons"
          ><svg
            class="octicon octicon-link"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"
            ></path></svg></a
        >Visual Studio Code - Icons
      </h1>
      <p><a href="https://github.com/microsoft/vscode-icons/blob/master/README.md">Go back to home</a></p>
      <table>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="center">Light</th>
            <th align="center">Dark</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const getOptimizedIcon = async (iconName, theme) => {
  let content;
  let optimized;

  try {
    content = await readfile(`icons/${theme}/${iconName}.svg`, {
      encoding: 'utf-8'
    });
  } catch(er) {
    console.error(er);
  }

  try {
    optimized = await svgo.optimize(content);
  } catch(er) {
    console.error(er);
  }

  return optimized.data;
};

const getVariations = async (iconName) => {
  const variations = {};

  for (const theme of ['light', 'dark']) {
    try {
      variations[theme] = await getOptimizedIcon(iconName, theme);
    } catch (er) {
      console.error(er);
    }
  }

  return variations;
}

const generatePreview = async () => {
  let icons;
  let body = '';

  try {
    icons = await readdir("icons/dark");
  } catch(er) {
    console.error(er);
  }

  for(f of icons) {
    const iconName = f.replace(/.svg$/g, "");
    const variations = await getVariations(iconName);

    body += `
          <tr>
            <td align="left">${iconName}</td>
            <td align="center">${variations.light}</td>
            <td align="center" style="background-color: #252526;">${variations.dark}</td>
          </tr>
    `;
  }

  try {
    await writefile('preview.html', renderPage(body));
  } catch(er) {
    console.error(er);
  }
};

generatePreview();
