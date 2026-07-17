const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend', 'public');

// Files to delete
const filesToDelete = [
    path.join(baseDir, 'portfolio.html'),
    path.join(baseDir, 'js', 'portfolio.js'),
    path.join(baseDir, 'css', 'portfolio.css')
];

filesToDelete.forEach(f => {
    if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        console.log('Deleted:', f);
    }
});

// Rename Resume Builder files
const filesToRename = [
    { from: path.join(baseDir, 'resume-builder.html'), to: path.join(baseDir, 'resume-generator.html') },
    { from: path.join(baseDir, 'js', 'resume-builder.js'), to: path.join(baseDir, 'js', 'resume-generator.js') }
];

filesToRename.forEach(f => {
    if (fs.existsSync(f.from)) {
        fs.renameSync(f.from, f.to);
        console.log('Renamed:', f.from, '->', f.to);
    }
});

// Global String Replacement
const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else if (dirFile.endsWith('.html') || dirFile.endsWith('.js') || dirFile.endsWith('.css')) {
            filelist.push(dirFile);
        }
    });
    return filelist;
};

const allFiles = walkSync(baseDir);

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/Resume Builder/g, 'Resume Generator');
    content = content.replace(/resume-builder\.html/g, 'resume-generator.html');
    content = content.replace(/resume-builder\.js/g, 'resume-generator.js');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated strings in:', file);
    }
});

console.log('Done renaming and cleaning up Portfolio Review.');
