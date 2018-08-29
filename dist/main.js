import { readFileSync } from 'fs';
import EventEmitter from 'events';
import { execSync, exec } from 'child_process';

class PackageController extends EventEmitter{constructor(a){super(),a||(a="./"),this.npmPackage=JSON.parse(readFileSync(a+"package.json"));}getPackage(){return this.npmPackage}getDevDependencies(){return this.npmPackage.devDependencies}getVersionPackage(){return this.npmPackage.version}getAuthor(){return this.npmPackage.author}getScripts(){return this.npmPackage.scripts}getDependencies(){return this.npmPackage.dependencies}getMain(){return this.npmPackage.main}getLicense(){return this.npmPackage.license}getDescription(){return this.npmPackage.description}getPackageVersion(a){let b=[];return a&&(this.hasPackage(a,"dependencies")&&b.push(this.npmPackage.dependencies[a]),this.hasPackage(a,"devDependencies")&&b.push(this.npmPackage.devDependencies[a]),this.hasPackage(a,"optionalDependencies")&&b.push(this.npmPackage.optionalDependencies[a])),b}hasPackage(a){let b=!1;return (this.npmPackage.dependencies&&this.npmPackage.dependencies.hasOwnProperty(a.name)||this.npmPackage.devDependencies&&this.npmPackage.devDependencies.hasOwnProperty(a.name)||this.npmPackage.optionalDependencies&&this.npmPackage.optionalDependencies.hasOwnProperty(a.name))&&(b=!0),a.version&&(this.npmPackage.dependencies&&this.npmPackage.dependencies.hasOwnProperty(a.name)&&this.npmPackage.dependencies[a.name]!=a.version||this.npmPackage.devDependencies&&this.npmPackage.devDependencies.hasOwnProperty(a.name)&&this.npmPackage.devDependencies[a.name]!=a.version||this.npmPackage.optionalDependencies&&this.npmPackage.optionalDependencies.hasOwnProperty(a.name&&this.npmPackage.optionalDependencies[a.name]!=a.version))&&(b=!1),b}hasPackageInDependencies(a){return !!this.npmPackage.dependencies.hasOwnProperty(a)}hasPackageInDevDependencies(a){return !!this.npmPackage.devDependencies.hasOwnProperty(a)}hasPackageInOptionalDependencies(a){return !!this.npmPackage.optionalDependencies.hasOwnProperty(a)}}

class NpmExec{constructor(){this.action,this.arguments=[],this.required={},this.errors={};}static hasNpm(){try{return execSync("npm -v")}catch(a){return console.log("npm is not installed"),!1}}checkErrors(a,b){let c=!0;return Object.keys(b).forEach(d=>{!a.hasOwnProperty(d)&&b[d].required?(c=!1,this.errors[d]="required"):a.hasOwnProperty(d)&&typeof a[d]!=b[d].value&&(c=!1,this.errors[d]="must be "+b[d].value);}),c}reset(){this.arguments=[];}prepareCommand(){this.reset();}launchExec(a){this.errors=!1;let b=["npm",this.action].concat(this.arguments);console.log("COMMNAD: "+b.join(" ")),exec(b.join(" "),(b,c,d)=>{b?a(d):a();});}}

class NpmInstall extends NpmExec{constructor(a){super(),this.valueTypes={save:{value:"string",required:!0},name:{value:"string",required:!0},version:{value:"string",required:!0},versionRange:{value:"object"},scope:{value:"string"},global:{value:"boolean",required:!0}};this.options=Object.assign({start:!0,save:"dev",version:"latest",global:!1},a);}prepareCommand(){super.prepareCommand(),this.action="install",this.setSaveMode(),this.setGlobal(),this.setNameAndVersion(),this.arguments.push(this.options.command),this.options.arguments&&this.options.arguments.length&&(this.arguments=this.arguments.concat(this.options.arguments));}setNameAndVersion(){if(this.options.version){let a=this.options.version,b=this.options.name;"object"==typeof a&&(a=this.getVersionRange(a)),this.options.scope&&(b=this.options.scope+"/"+this.options.name),this.arguments.push(b+"@"+a);}}setGlobal(){this.options.global&&this.arguments.push("--global");}getVersionRange(a){let b;return b=">="+a.minor+" ",b+="<="+a.mayor,"\""+b+"\""}setSaveMode(){this.options.save?this.arguments.push("--save-"+this.options.save):this.arguments.push("--no-save");}launch(){return new Promise((a,b)=>{this.checkErrors(this.options,this.valueTypes)?(this.prepareCommand(),this.launchExec(a)):b(this.errors);})}}

class NpmUninstall extends NpmExec{constructor(a){super(),this.valueTypes={save:{value:"string",required:!0},name:{value:"string",required:!0},version:{value:"string"},versionRange:{value:"object"},scope:{value:"string"},global:{value:"boolean",required:!0}};this.options=Object.assign({start:!0,save:"dev",global:!1},a);}prepareCommand(){super.prepareCommand(),this.action="uninstall",this.setSaveMode(),this.setGlobal(),this.setName(),this.arguments.push(this.options.command),this.options.arguments&&this.options.arguments.length&&(this.arguments=this.arguments.concat(this.options.arguments));}setVersion(){if(this.options.version){let a=this.options.version,b=this.options.name;"object"==typeof a&&(a=this.getVersionRange(a)),this.options.scope&&(b=this.options.scope+"/"+this.options.name),this.arguments.push(b+"@"+a);}}setName(){if(this.options.version)this.setVersion();else{let a=this.options.name;this.options.scope&&(a=this.options.scope+"/"+this.options.name),this.arguments.push(a);}}setGlobal(){this.options.global&&this.arguments.push("--global");}getVersionRange(a){let b;return b=">="+a.minor+" ",b+="<="+a.mayor,"\""+b+"\""}setSaveMode(){this.options.save?this.arguments.push("--save-"+this.options.save):this.arguments.push("--no-save");}launch(){return new Promise((a,b)=>{this.checkErrors(this.options,this.valueTypes)?(this.prepareCommand(),this.launchExec(a)):b(this.errors);})}}

class NpmRun extends NpmExec{constructor(a){super(),this.valueTypes={command:{value:"string",required:!0},arguments:{value:"string"}};this.options=Object.assign({start:!0},a);}prepareCommand(){super.prepareCommand(),this.action="run",this.arguments.push(this.options.command),this.options.arguments&&this.options.arguments.length&&(this.arguments=this.arguments.concat(this.options.arguments));}launch(){return new Promise((a,b)=>{this.checkErrors(this.options,this.valueTypes)?(this.prepareCommand(),this.launchExec(a)):b(this.errors);})}}

class SimpleNpmApi extends EventEmitter{constructor(){return super(),NpmExec.hasNpm()?void(this.npmPackage=new PackageController):null}install(a){let b=new NpmInstall(a);return b.options.start?new Promise((a,c)=>{b.launch().then(b=>{a(b);}).catch(a=>{c(a);});}):b}uninstall(a){if(this.npmPackage.hasPackage(a)){let b=new NpmUninstall(a);return b.options.start?new Promise((a,c)=>{b.launch().then(b=>{a(b);}).catch(a=>{c(a);});}):b}return null}run(a){let b=new NpmRun(a);return b.options.start?new Promise((a,c)=>{b.launch().then(b=>{a(b);}).catch(a=>{c(a);});}):b}}

export default SimpleNpmApi;
