# Electron file drop crash reproduction on Linux

29.10.2024

This repo showcases a crash in Electron on Linux. I am pretty sure the crash originates from V8.

- Electron v33.0.2
- Linux Mint 22 Cinnamon
- Linux Kernel 6.8.0-47-generic
- NodeJS (see version in .nvmrc)

## Setup

- Clone the repo
- Go to the repo dir
- Run `npm i`
- Run `npm run dev:front` to open the Vite dev server
- Open another terminal and run `npm run dev`
- The app should open

## Summary

In order to crash the app, drag and drop files from the file explorer into it. The crash seems somewhat linked to the file size. Dropping in smaller files allows the app to not crash for longer. A good file size I have determined while testing is in the multiple MB range think like 5 - 10 MB. Sometimes the crash is instant, other times it takes a while to crash. It also may have something to do with user interaction. Clicking in the app after dropping a file seems to produce a crash faster. This may however be just my own bias.

## Areas of interest in the code

Commenting out the ipc call in `App.tsx` causes the crash to not happen.

```ts
const files = await Api.crashTheApp(event.dataTransfer.files);
```

This may be related to the webUtils function call in `preload.js`.

```js
contextBridge.exposeInMainWorld("electron", {
  crashTheApp: (files) => {
    const paths = [];
    for (let i = 0; i < Object.keys(files).length; i++) {
      paths.push(webUtils.getPathForFile(files[i]));
    }
    return ipc.invoke("crashTheApp", paths);
  },
});
```

The actual handler can probably return anything, in this repro it just returns an empty array.

The context of this is that I develop a music player and I would like to drag and drop files into it. However, the path attribute that used to exist in the `dataTransfer.files` object is no longer preferred, so in order to get the actual path of the file (which is needed for sticking it into an audio element src in order to play the file), I tried using webUtils.

If you have trouble reproducing this on your machine, using the filepath to play it in an audio element I have found is a surefire way to crash the app. I have not had a hard time reproducing this many times however so I decided to not complicate the repro by adding the audio element.

After a successful crash the error is similar to the one below:

```sh
Received signal 11 SEGV_MAPERR 000000000008
#0 0x57b1d22cb24a (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x60fc249)
#1 0x57b1d22db709 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x610c708)
#2 0x7754c9a45320 (/usr/lib/x86_64-linux-gnu/libc.so.6+0x4531f)
#3 0x57b1cfcc2021 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3af3020)
#4 0x57b1cfdbef08 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3beff07)
#5 0x57b1cfd3be93 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3b6ce92)
#6 0x57b1cfd3b3a4 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3b6c3a3)
#7 0x57b1cfd50689 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3b81688)
#8 0x57b1cfd5055f (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3b8155e)
#9 0x57b1d05951ab (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x43c61aa)
#10 0x57b1cfd37955 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3b68954)
#11 0x57b1cfd968f4 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x3bc78f3)
#12 0x57b1d226e36f (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x609f36e)
#13 0x57b1d228ebf2 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x60bfbf1)
#14 0x57b1d22269c7 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x60579c6)
#15 0x57b1d228f371 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x60c0370)
#16 0x57b1d224e79e (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x607f79d)
#17 0x57b1d44fc99c (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x832d99b)
#18 0x57b1ce9edad4 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x281ead3)
#19 0x57b1ce9ee2f8 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x281f2f7)
#20 0x57b1ce9ef3a6 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x28203a5)
#21 0x57b1ce9ed03a (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x281e039)
#22 0x57b1ce9ed120 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x281e11f)
#23 0x57b1ce69bf97 (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x24ccf96)
#24 0x7754c9a2a1ca (/usr/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9)
#25 0x7754c9a2a28b (/usr/lib/x86_64-linux-gnu/libc.so.6+0x2a28a)
#26 0x57b1ce27802a (/home/miika/repos/electron-file-drop-crash/node_modules/electron/dist/electron+0x20a9029)
  r8: 00000000000006b5  r9: 0000000000000004 r10: 0000000080022018 r11: 0000000000000000
 r12: 00001b940198fc00 r13: 00001b94019905f0 r14: 00000000000009b0 r15: 00000000000013b0
  di: 0000000000000000  si: 00007ffc7f579740  bp: 00007ffc7f579710  bx: 0000000000000000
  dx: 000077546b000000  ax: 00001e4400413659  cx: 00001b94019905f0  sp: 00007ffc7f579700
  ip: 000057b1d1a24855 efl: 0000000000010246 cgf: 002b000000000033 erf: 0000000000000004
 trp: 000000000000000e msk: 0000000000000000 cr2: 0000000000000008
[end of stack trace]
../../sandbox/linux/seccomp-bpf-helpers/sigsys_handlers.cc:**CRASHING**:seccomp-bpf failure in syscall nr=0x25 arg1=0x5 arg2=0x7ffc7f578230 arg3=0x0 arg4=0x8
Renderer process crashed
```
