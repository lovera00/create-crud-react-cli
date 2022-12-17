#!/usr/bin/env node

const program = require('commander');

// import function to create a component
const component = require('../lib/component');

/*******************************************/
/* COMMANDS */

// Create a component
// $ create-react-componenet component
// $ create-react-componenet c
program
    .command('crud') // sub-command name
    .alias('c') // alternative sub-command is `c`
    .description('Create a crud component') // command description

    // function to execute when command is uses
    .action(function () {
        component();
    });


// allow commander to parse `process.argv`
program.parse(process.argv);