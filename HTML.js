import "/libraries/lodash/lodash.js"
// import "/libraries/Polyfills/Object/Object.js"

// complete - add multi element inheritance support e.g. HTML.render(["div","centers","bluebox"],{},this)
// complete - add nested object assignment for properties
// complete - add support for condition specific property assignment e.g. {conditions:[{variable:elm.style.color,value:"orange"}],properties:{}}
// complete - allow an element template to be replaced with the element itself after attachment to the dom
// complete - support for appending elements to HTML templates via HTML template name e.g. HTML.append("one","two")
// add onload event for when an element becomes attached to dom (not just its parent element)

window.HTML = class{
    /*
    createElement
    HTML.createElement("div")
    HTML.createElement("div",{...})
 
    HTML.createElement(["flexbox"])
    HTML.createElement(["flexbox"],{...})
    HTML.createElement(["flexbox","bluebox"],{...})
 
    HTML.createElement(<div></div>)
    HTML.createElement(<div></div>,{...})
    */
    static createElement(elements,props={}){
        // console.log("creating element\n","elements:",elements,"props:",props);

        let assimilation;
        let element;

        if(elements.nodeName){
            assimilation = {type:elements.nodeName,props:props}           
            element = elements;
        }else if((typeof elements == "string") && (this.templates[elements].nodeName)){
            assimilation = {props:props};
            element = this.templates[elements];
        }else{
            assimilation = this._assimilate(elements,props);
            element = document.createElement(assimilation.type);
        }

        const style = assimilation.props.style;
        delete assimilation.props.style;
        assimilation.props && Object.assign(element,assimilation.props) && style && Object.assign(element.style,style);

        // console.log("element:",assimilation);

        for(let i=0;i<element._created.length;i++){element._created[i].bind(element)()};
        !element._observed && element.conditionalProperties && (new this._observation(element));
        if(element.cast){this.templates[element.cast] = element};
        return element;
    }
    static _observation = class{
        constructor(element){
            // console.log("observing:",element);
            // this.conditionalProperties = element.conditionalProperties || element.cp;
            // if(!this.conditionalProperties){console.log("element has no conditional properties"); return false};
            this.element = element;
            this.processConditionalProperties(element.conditionalProperties);
            element._observed = true;
        }
        processConditionalProperties(conditionalProperties){
            // console.log("processing conditional properties");
            for(let i=0;i<conditionalProperties.length;i++){
                const conditionalProperty = conditionalProperties[i];
                conditionalProperty.ready = false;
                // console.log("conditionalProperty:",conditionalProperty);
                this.processConditions(conditionalProperty);
            }
        }
        processConditions(conditionalProperty){
            // console.log("processing conditions");
            const conditions = conditionalProperty.conditions;
            const properties = conditionalProperty.properties;
            for(let i=0;i<conditions.length;i++){
                const condition = conditions[i];
                // console.log("condition:",condition);
                condition._truthReference = {};
                // condition._ready = false;
                Object.defineProperty(condition,"_ready",{configurable:true,set:(setting)=>{this._conditionHandler(setting,condition,conditions,properties)}});
                this.processProperties(condition);
            }
        }
        processProperties(condition){
            // console.log("processing properties");
            const propertyKeys = Object.keys(condition.targetProperties);
            const _propertyHandler = this._propertyHandler;
            _.each(condition.targetProperties,(value,keyString)=>{
                // console.log("property\n","value:",value,"keyString:",keyString);
                const keys = keyString.split(".");
                // console.log("keys:",keys);
                const lastKeyIndex = keys.length - 1;
                // console.log("lastKeyIndex:",lastKeyIndex);
                const propertySelector = keys[lastKeyIndex];
                // console.log("propertySelector:",propertySelector);
                const subObjectSelector = keys.slice(0,lastKeyIndex).join(".");
                // console.log("subObjectSelector:",subObjectSelector);
                const subObject = (!subObjectSelector && condition.target) || _.get(condition.target,subObjectSelector);
                // console.log("subObject:",subObject);
                const property = subObject[propertySelector];
                // console.log("property:",property);
                Object.defineProperty(subObject,propertySelector,{configurable:true,set:(setting)=>{_propertyHandler(setting,value,condition,keyString,propertyKeys)}});
                // subObject.watch(propertySelector,(setting)=>{_propertyHandler.bind(subObject)(setting,value,condition,keyString,propertyKeys)});
                // console.log('one:',property,'value:',value)
                if(property == value){subObject[propertySelector] = property};
            });
        }
        async _propertyHandler(setting,value,condition,keyString,propertyKeys){
            // console.log("property changed");
            // console.log("setting:",setting);
            // console.log("value:",value);
            // console.log("condition:",condition);
            // console.log("keyString:",keyString);
            condition._truthReference[keyString] = setting == value ? true : false;
            let allTruths = true;
            await propertyKeys.find((propertyKey)=>{if(!condition._truthReference[propertyKey]){condition._truthReference[propertyKey] = false; allTruths = false; return true}});
            // console.log("alltruths:",allTruths,"_ready:",condition.ready)
            if(condition.ready != allTruths){condition._ready = allTruths};
            // console.log("conditionready:",condition.ready);
            // if(setting == value){
            //     condition._truthReference[keyString] = true;
                // let allTruths = true;
                // await propertyKeys.find((propertyKey)=>{if(!condition._truthReference[propertyKey]){condition._truthReference[propertyKey] = false; allTruths = false; return true}});
                // if(condition._ready != allTruths){condition._ready = allTruths};
            //     console.log("condition:",condition);

            // }else{
            //     condition._truthReference[keyString] = false;
            // }

            // console.log("condition ready:",condition._ready);
        }
        async _conditionHandler(setting,condition,conditions,properties){
            // console.log("condition truth changed");
            condition.ready = setting;
            let allTruths = true;
            // console.log('s:',conditions)
            await conditions.find((cur)=>{if(!cur.ready){allTruths = false; return true}});
            allTruths && HTML.createElement(this.element,properties);
        }
    }
    /*
    render
    HTML.render("div",<div></div>)
    HTML.render("div",{...},<div></div>)
    HTML.render("div","stage")
    HTML.render("div",{...},"stage")

    HTML.render(["redbox","bigbox"],<div></div>)
    HTML.render(["redbox","bigbox"],{...},<div></div>)
    HTML.render(["redbox","bigbox"],"stage")
    HTML.render(["redbox","bigbox"],{...},"stage")    

    HTML.render(<div></div>,<div></div>)
    HTML.render(<div></div>,{...},<div></div>)
    HTML.render(<div></div>,"stage")
    HTML.render(<div></div>,{...},"stage")
    */
    static render(elements,props,parent=props){
        // console.log("rendering:",elements);
        if(typeof parent == "string"){parent = this.templates[parent]};
        parent.innerHTML = "";
        return this.append(elements,props,parent);
    }
    /*
    append
    HTML.append("div",<div></div>)
    HTML.append("div",{...},<div></div>)
    HTML.append("div","stage")
    HTML.append("div",{...},"stage")

    HTML.append(["redbox","bigbox"],<div></div>)
    HTML.append(["redbox","bigbox"],{...},<div></div>)
    HTML.append(["redbox","bigbox"],"stage")
    HTML.append(["redbox","bigbox"],{...},"stage")    

    HTML.append(<div></div>,<div></div>)
    HTML.append(<div></div>,{...},<div></div>)
    HTML.append(<div></div>,"stage")
    HTML.append(<div></div>,{...},"stage")
    */
    static append(elements,props,parent=props){
        // console.log("appending:",elements,"to:",parent);
        const element = this.createElement(elements,parent == props ? {} : props);
        if(typeof parent == "string"){parent = this.templates[parent]};
        (element.insertionIndex == undefined) ? parent.appendChild(element) : parent.insertBefore(element,parent.children[element.insertionIndex]);
        for(let i=0;i<element._attached;i++){element._attached[i].bind(element)()};
        // console.log("\n");
        return true;
    }
    /*
    template
    HTML.template("div","stage")
    HTML.template("div",{...},"stage")
    
    HTML.template(["redbox","bigbox"],"stage")
    HTML.template(["redbox","bigbox"],{...},"stage")
    */
   static createTemplate(elements,props,name=props){
        if(name == props){props = {}};
        // console.log("creating template\n","elements:",elements,"props:",props,"name:",name);
        const assimilation = this._assimilate(elements,props);
        // console.log("\n");
        return this.templates[name] = {type:assimilation.type,props:assimilation.props};
    }
    /*
    assimilate
    HTML.assimilate("div")
    HTML.assimilate("div",{...})

    HTML.assimilate(["redbox","bigbox"])
    HTML.assimilate(["redbox","bigbox"],{...})
    */
    static _assimilate(elements,props){
        // console.log("assimilating\n","elements:",elements,"props:",props);

        let elementList;

        if(typeof elements == "string"){
            if(this.templates[elements]){
                if(this.templates[elements]._created){_.merge(this.templates[elements].props,props); return this.templates[elements]};
            }else{
                return {type:elements,props:props};
                // console.log("assimilation:",{type:elements,props:props});
            }
            // if(!this.templates[elements]){console.log("assimilation:",{type:elements,props:props}); return {type:elements,props:props}};
            elementList = [elements];
        }else{
            elementList = elements;
        }

        // console.log("elementList:",elementList);

        const _type = this.templates[elementList[elementList.length - 1]].type;
        const _props = {_created:[],_attached:[]};
        for(let i=0;i<elementList.length;i++){
            const element = elementList[i];
            const template = this.templates[element];
            // console.log("template:",template,element);
            // console.log("created:",_props)
            _.merge(_props,template.props);
            template.props.created && _props._created.push(template.props.created);
            template.props.attached && _props._attached.push(template.props.attached);
        }

        const assimilation = {type:_type,props:_.merge(_props,props)};
        // console.log("assimilation:",assimilation);
        
        return assimilation;
    }
    /*
    delete
    HTML.delete("stage")
    */    
   static delete(name){
       // console.log("deleting:",name);
       return delete this.templates[name];
    }    
    static templates = {}
}