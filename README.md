# HTML.JS

A React JS alternative with built in state management.

```js
HTML.createTemplate(
    "div",
    {
        style:{
            height:"10vh",
            width:"10vh",
            borderRadius:"50vh",
            background:"blue"
        }
    },
    "blue ball"
);

HTML.createTemplate(
    "div",
    {
        created:function(){
            this.animate(this.style.keyFrames,this.style.keyFramesMetrics);
        },
        style:{
            animationDuration:"3s",
            keyFrames:[
                {transform: "translateY(0px)"}, 
                {transform: "translateY(200px)"}
            ],
            keyFramesMetrics:{
                duration: 1000,
                iterations: Infinity,
                direction: "alternate"
            }
        }
    },
    "bouncy ball"
);

HTML.createTemplate(
    ["blue ball","bouncy ball"],
    {
        style:{
            borderWidth:"10px",
            borderColor:"black",
            borderStyle:"solid"
        }
    },
    "bouncy blue ball"
)

HTML.render("bouncy blue ball",document.getElementById("root"));
```

## Features
* **State Management:** HTML.JS allows you to build user interfaces in a simple and straightforward way. No more switching between files to work on a single piece (component). You can simply define everything about a particular piece within its own data.
* **Component Based:** You can build components that make production of both the UI and other features modular, which speeds up development time, productivity, and allows you to reuse the same code throughout multiple projects as well as easily share code with others.
* **Simple:** With HTML.JS there is no special or additional language to learn to get started (e.g. JSX). Knowledge of javascript is the only requirement. 

## Installation

```bash
$ git clone https://github.com/CR3SS/HTML.JS
```
## Developers

[CR3SS](https://linktr.ee/cr3ss)

## License

  [MIT](LICENSE)
