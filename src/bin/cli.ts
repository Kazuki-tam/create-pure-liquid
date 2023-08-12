#!/usr/bin/env node
import { execSync } from 'child_process';
import { showSuccessMessage } from './helper/showSuccessMessage';
import inquirer from 'inquirer';

const runCommand = (command: string) => {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
};

const projectName = process.argv[2] || 'pure-liquid';
const gitCheckoutCommand = `git clone --depth 1 https://github.com/Kazuki-tam/pure-liquid.git ${projectName}`;

console.log(`Cloning the repository with name ${projectName}`);

const checkOut = runCommand(gitCheckoutCommand);
if (!checkOut) process.exit();

const listQuestions = [
  {
    type: 'list',
    name: 'manager',
    message:
      'What package manager do you want to use?(type: npm or yarn or pnpm)',
    choices: ['yarn', 'pnpm', 'npm'],
  },
];

type managerType = {
  manager: string;
};

inquirer
  .prompt(listQuestions)
  .then((answers: managerType) => {
    const packageManager = answers.manager || 'yarn';
    console.log(
      `Installing dependencies for ${projectName} using ${packageManager}`,
    );
    return packageManager;
  })
  .then((packageManager) => {
    const defaultCommand = `cd ${projectName} && rm -rf .git && ${packageManager} install`;
    const otherCommand = `cd ${projectName} && rm -rf yarn.lock .yarn .yarnrc.yml .git && ${packageManager} install`;
    const installCommand =
      packageManager === 'yarn' ? defaultCommand : otherCommand;
    const installedDeps = runCommand(installCommand);
    if (!installedDeps) process.exit();
    showSuccessMessage('💧', projectName, packageManager);
  })
  .catch((error: { isTtyError: string }) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      throw new Error(`Prompt couldn't be render in current environment...`);
    } else {
      // Something else went wrong
      throw new Error(`Something else went wrong...`);
    }
  });
