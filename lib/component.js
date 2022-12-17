const inquirer = require('inquirer');
const colors = require('colors');
const pad = require('pad');
const fs = require('fs');
const path = require('path');
const { dirname } = require('path');

const questions = [
    { type: 'input', name: 'dominio', message: 'Escribe el dominio del cual se va a realizar el CRUD', default: 'ejemplo: usuarios' },
    { type:'input', name: 'cantidad', message: 'Escribe la cantidad de campos que tendrá el CRUD', default: 'ejemplo: 3' },

];

//crear una funciona que reciba como parametro una array de objetos con los campos del CRUD
function generateTemplate(campos,dominio) {
    //console.log(campos,dominio);
    // Get the absolute path to the template file
    let dirname = path.resolve(__dirname, '../templates/template.jsx');
    //console.log(dirname);
    const template = fs.readFileSync(dirname, 'utf8');
     // Replace placeholders in the template with provided values
    let output = template.replace(/{{endpoint}}/g, dominio);
    //console.log(dominio);

    var columnas = '';
        columnas += '{\n';
        columnas += 'accessorKey: \''+campos[0].name+'\',\n';
        columnas += 'header: \''+campos[0].name.toUpperCase()+'\',\n';
        columnas += 'enableColumnOrdering: false,\n';
        columnas += 'enableEditing: false,\n';
        columnas += 'enableSorting: false,\n';
        columnas += 'size: 80,\n';
        columnas += '},\n';
        output = output.replace(/{{columnas}}/g, columnas);
    //console.log(columnas);
    var columnasEdit = '';
    for (var i = 0; i < campos.length; i++) {
        columnasEdit += '{\n';
        columnasEdit += 'accessorKey: \''+campos[i].name+'\',\n';
        columnasEdit += 'header: \''+campos[i].name.toUpperCase()+'\',\n';
        columnasEdit += 'muiTableBodyCellEditTextFieldProps: ({ cell }) => ({\n';
        columnasEdit += '...getCommonEditTextFieldProps(cell),\n';
        columnasEdit += '}),\n';
        columnasEdit += '},\n';
    }
    output = output.replace(/{{columnasEdit}}/g, columnasEdit);
    //console.log(columnasEdit);
    var columnasPDF = '';
    for (var i = 0; i < campos.length; i++) {
        columnasPDF += '{ title: \''+campos[i].name.toUpperCase()+'\', dataKey: \''+campos[i].name+'\' },\n';
    }
    output = output.replace(/{{columnasPDF}}/g, columnasPDF);
    //console.log(columnasPDF);
    var columnasExcel = '';
    for (var i = 0; i < campos.length; i++) {
        columnasExcel += '{ label: \''+campos[i].name.toUpperCase()+'\', key: \''+campos[i].name+'\' },\n';
    }
    output = output.replace(/{{columnasExcel}}/g, columnasExcel);
    //console.log(columnasExcel);
    var columnasRow = '';
    for (var i = 0; i < campos.length; i++) {
        columnasRow += campos[i].name+': row.'+campos[i].name+',\n';
    }
    output = output.replace(/{{columnasRow}}/g, columnasRow);
    //console.log(columnasRow);

    var columnasForm = '';
    for (var i = 0; i < campos.length; i++) {
        columnasForm += '<TextField\n';
        columnasForm += 'label="'+campos[i].name.toUpperCase()+'"\n';
        columnasForm += 'name="'+campos[i].name+'"\n';
        columnasForm += 'onChange={(e) =>\n';
        columnasForm += 'setValues({ ...values, [e.target.name]: e.target.value })\n';
        columnasForm += '}\n';
        columnasForm += '/>\n';
    }
    output = output.replace(/{{columnasForm}}/g, columnasForm);
    //console.log(columnasForm);

    output = output.replace(/{{deleteIdentificator}}/g, campos[1].name);

    // Write the modified template to a new file in the current working directory
    const outputPath = path.resolve(process.cwd(), 'index.jsx');
    console.log(pad(colors.grey('Ruta de salida: '), 30), outputPath);
    fs.writeFileSync(outputPath, output, 'utf8');
}

module.exports = function () {
    inquirer
        .prompt(questions)
        .then(function (answers) {
            console.log('CREACION DE CRUD');
            console.log('------------------');

            console.log(pad(colors.grey('Dominio: '), 30), answers.dominio);
            console.log(pad(colors.grey('Cantidad de campos: '), 30), answers.cantidad);

            //armar array de campos de acuerdo a la cantidad de campos ingresada
            var campos = [];
            var columnas = [];
            var dominio = answers.dominio;
            for (var i = 1; i <= answers.cantidad; i++) {
                campos.push({ type: 'input', name: 'campo'+i, message: 'Escribe el nombre del campo '+i });
            }
            inquirer
                .prompt(campos)
                .then(function (answers) {
                    console.log('Campos del CRUD');
                    console.log('------------------');
                    for (var i = 1; i <= campos.length; i++) {
                        console.log(pad(colors.grey('Campo '+i+': '), 30), answers['campo'+i]);
                        //cargar columnas
                        columnas.push({ name: answers['campo'+i] });
                    }
                    generateTemplate(columnas,dominio);
                }
            );
        }
    );
};
