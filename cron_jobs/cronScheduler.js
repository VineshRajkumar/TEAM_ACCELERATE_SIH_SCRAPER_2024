// TO RUN COMMANDS PARALLLELY 
import { spawn } from 'child_process';

import { cwd } from 'process'; // Import current working directory for cron jobs

const projectDir = '/mnt/c/Users/aspir/OneDrive/Desktop/Hackathon/SIH/SIH_Scraper'; // Set this to the directory of your package.json for cron jobs

const runCommand = (command) => {
  const cmd = spawn(command, { shell: true, cwd: projectDir });

  cmd.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  cmd.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  cmd.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
  });
};

// Run both commands in parallel
runCommand('npm run newsdev');
runCommand('npm run dev');












//TO RUN COMMANDS sequentially
// import { spawn } from 'child_process';


// const runCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     const cmd = spawn(command, { shell: true });

//     cmd.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });

//     cmd.stderr.on('data', (data) => {
//       console.error(`stderr: ${data}`);
//     });

//     cmd.on('close', (code) => {
//       if (code === 0) {
//         resolve(); // Resolve the promise if the command succeeded
//       } else {
//         reject(`Child process exited with code ${code}`); // Reject if the command failed
//       }
//     });
//   });
// };


// const runCommandsSequentially = async () => {
//   try {
//     await runCommand('npm run newsdev'); 
//     await runCommand('npm run dev');     
//   } catch (error) {
//     console.error(`Error: ${error}`); 
//   }
// };


// runCommandsSequentially();
