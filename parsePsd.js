fs = require('fs');

var PSD = require('psd');
var fileName = "/test-website-maker.psd";
var psd = PSD.fromFile(__dirname + fileName);
psd.parse();

var psdTree = psd.tree();
var psdChildren = psdTree.descendants();
var docWidth = psdTree.export().document.width;
var docHeight = psdTree.export().document.height;

if (!fs.existsSync('img')){
    fs.mkdirSync('img');
}

psdChildren.forEach(child => {
    PSD.open(__dirname + fileName).then(psd => {
        child.get('layer').image.saveAsPng(__dirname + '/img/' +child.name +'.png');
    });
});

var getContent = (child, i) => {
    var childObj = psdTree.export().children[i] && psdTree.export().children[i].text;
    if (childObj === undefined) {
        return '\n';
    } else {
        return '<p>' + childObj.value + '</p>' + '\n';
    }
};

var bodyContent = psdChildren.map((child, i) =>
    '<div class="class' + child.name.split(' ').join('-') + '">' +
    getContent(child, i) +
    '\n' + '</div>' + '\n'
);

var getBackgroundStyle = (child, i) => {
    var childObj = psdTree.export().children[i] && psdTree.export().children[i].text;
    if (childObj === undefined
    && child.get('layer').image.obj.hasMask
    ) {
        return 'background-image: url("img/'
        + child.name +'.png' + '");' + '\n'
        + '\n' + 'background-size: cover;' + '\n'
        + 'background-position: center center;' + '\n';
    }
    else {
        return 'background-image: url("img/'
        + child.name +'.png' + '");' + '\n'
        + 'background-size: contain;' + '\n'
        + 'background-repeat: no-repeat;' + '\n'
        + 'background-position: center center;' + '\n'
    }
};

var cssContent = psdChildren.map((child, i) =>
    '.class' + child.name.split(' ').join('-') + '{' + '\n'

    + getBackgroundStyle(child, i)

    + 'width: ' + (child.width*100)/docWidth + '%;' + '\n' + 'height: ' + (child.height*100)/docHeight
    + '%;' + '\n' + 'position: absolute;' + '\n' + 'top: ' + (child.top*100)/docHeight + '%;' + '\n' + 'left: '
    + (child.left*100)/docWidth + '%;' + '\n' + 'z-index: ' + (999 - i) + ';' + '\n' + '}' + '\n'
).join('');

var htmlContent =
    '<!DOCTYPE html>' + '\n' +
    '<html>' + '\n' +
    '<head>' + '\n' +
    '<link rel="stylesheet" type="text/css" href="styles.css">' + '\n' +
    '<title>' + '\n' +
    'test website' + '\n' +
    '</title>' + '\n' +
    '</head>' + '\n' +
    '<body>' + '\n' +
    bodyContent.join('') + '\n' +
    '</body>' + '\n' +
    '</html>';

fs.writeFile('index.html', htmlContent, function (err) {
  if (err) return console.log(err);
  console.log('index.html');
});
fs.writeFile('styles.css', cssContent, function (err) {
  if (err) return console.log(err);
  console.log('styles.css');
});
