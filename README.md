# PF2E Persistent Damage
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FCarlosFdez%2Fpf2e-persistent-damage%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)

Small module to keep track of persistent damage for pathfinder 2E. Derived from the condition setter macro from mothringer, its been edited to focus on persistent damage using the effects system. Access via macros in the compendium.

## How to Install

### Manual Install
In Foundry setup, click on the Install Module button and put the following path in the Manifest URL. You could also use a path from a specific release.

`https://github.com/CarlosFdez/pf2e-persistent-damage/releases/latest/download/module.json`

## How to Use
The module comes with a compendium with two macros, Add Persistent Damage and Process Persistent Damage.

### Add Persistent Damage
Use to add persistent damage effects to selected tokens. These effects can be removed either in the sheet or via right clicking in the "effects panel". Make sure the effects panel is enabled in the left toolbar to see it.

![image](https://user-images.githubusercontent.com/1286721/111531022-62c71800-873a-11eb-8a15-06d017b8d4a6.png)

### Process Persistent Damage
Use to inspect selected tokens for all persistent damage effects and create chat messages for them. On each chat message, clicking on the actor name will select the token, allowing the chat damage buttons to work for that token.

![image](https://user-images.githubusercontent.com/1286721/111531253-a4f05980-873a-11eb-83b6-51a8939003f6.png)

## How to Build
It is recommended to use VSCode for the project, but anything else that can handle typescript will work. Node 14 or higher is required.

1) Open a terminal in the root folder
2) `npm install`
3) `npm run watch` for development or `npm run build` for a one time build
4) Build will be in the `dist` folder. Create a symlink to the foundry modules folder for development.
