// I am using modules and webpack so there are import keywords here.
import m = require("mithril");
import {AppState} from "./AppState";
import {Message} from "hl7parser";
import {HL7Service, IObxValue} from "../../services/HL7Service";

// I am using AppState as the state example. This is not usually needed in TS component
// You can easily just supply <any> in place.

// I am using modules and webpack so there is the export keyword here.
export class ExampleCompo implements m.ClassComponent<AppState> {

    private labsMessage?: Message;
    private vitalsMessage?: Message;
    private labs?: IObxValue[];
    private vitals?: IObxValue[];

    constructor(private appState: AppState) {
    }

    oninit = (n: m.Vnode<AppState, any>) => {
        // This is a dmonstration that you can add a state object to the Vnode. 
        // Almost never needed to do it. 
        n.state = this.appState;
        Promise.all([
            this.fetchLabTemplate(), this.fetchVitalsTemplate()])
        .then(()=>{})
            .catch((err)=>{return err;});
    };

    abbreviate = (unit: string): string => {
        if (unit === "thousand cells per microliter") {
            return "k cells/ml";
        }
        if (unit === "million cells per microliter") {
            return "M cells/ml";
        }
        if (unit === "grams per deciliter") {
            return "g/cc";
        }
        return unit;
    };

    onValueChange = (event: Event) => {
        const e = event.currentTarget as HTMLInputElement;
        debugger;
        const ev = e.value;
        const f = Number.parseFloat(ev);
        const code = e.id.substr(1);
        const section = e.id.substr(0,1);
        if (section === "L" && this.labs && this.labsMessage) {
            let v = HL7Service.findOBXResultsBy(this.labs, code)[0];
            v.value = f;
            HL7Service.updateOBXResult(this.labsMessage, v);
        }
        if (section === "V" && this.vitals && this.vitalsMessage) {
            let v = HL7Service.findOBXResultsBy(this.vitals, code)[0];
            v.value = f;
            HL7Service.updateOBXResult(this.vitalsMessage, v);
        }
    };

    public view(n: m.Vnode<AppState>) {
        const my = this;
        debugger;
        let rowStyles = [ ".c-even-row", ".c-odd-row"];

        let rc = -1;
        const makeRow = (i: IObxValue, section: string) => {
            rc++;
            const st = i.valueStatus;
            const status = HL7Service.expandHLN(i.valueStatus);
            const style = rowStyles[rc % 2];
            let btn = "btn-info";
            if (st === "L") {
                btn = "btn-warning";
            }
            if (st === "H") {
                btn = "btn-danger";
            }
            return m(`.row${style}`,
                m(".col", i.name),
                m(".col",
                    m(`button.btn-xs.${btn}[style=width:90%]`, status)),
                m(".col",
                    m("input[type=text]",
                        {
                            id: section + i.code,
                            onchange: this.onValueChange,
                            oncreate: (v: m.VnodeDOM<any, any>) => {
                                // Demonstrating what happens when oncreate() is added to a node like this.
                                // You will see for example attrs.style with "withd:40px" in here.
                                // and v.dom will point to this input HTML element (HTMLInputElement class). 
                                debugger;
                            },
                            style: "width:40px;",
                            value: i.value.toString(10)
                        }
                    ),
                    m.trust("&nbsp;"),
                    `${this.abbreviate(i.unit)}`),
                m(".col", i.normal),
                );
        };

        const makeHeader = () => {
            return m(".row.c-head-row",
                m(".col", "Observation"),
                m(".col", "Status"),
                m(".col", "Value"),
                m(".col", "Normal Range"),
                );
        };

        if (this.labs && this.vitals) {

            let labsElems = this.labs.map<m.Vnode>(
                (item: IObxValue) => makeRow(item, "L")
            );

            let vitalsElems = this.vitals.map<m.Vnode>(
                (item: IObxValue) =>
                    makeRow(item, "V")
            );

            return m("", [
                makeHeader(),
                m("", labsElems),
                m("", vitalsElems)
                ]);
        }
        return m("", "No Data");
    };

    //
    // HTTP GET Example.
    // If you want POST, set opt.mthod = "POST" and
    // opt.data with any data object you have. It will stringify as JSON.
    //
    private fetchLabTemplate = () => {
        // If you know the return data type you can use <YourClass> instead of <any> and "res:" when
        // you get the data back will be of that type.
        let opt = {} as m.RequestOptions<any>;
        let url = "/api/labs";
        m.request(url, opt).then(
            (res: any)=>{
                this.labsMessage = HL7Service.parse(res.hl7);
                this.labs = HL7Service.getObxNumberResults(this.labsMessage);
                console.debug(`${this.labs.toString()}`);
                // If you do return res; here then it will return the Promise of the data.
            })
            .catch((err)=>{
                console.error(`${err}`);
                return err;});
    };

    private fetchVitalsTemplate = () => {
        let opt = {} as m.RequestOptions<any>;
        let url = "/api/vitals";
        m.request(url, opt).then(
            (res)=>{
                this.vitalsMessage = HL7Service.parse(res.hl7);
                this.vitals = HL7Service.getObxNumberResults(this.vitalsMessage);
            })
            .catch((err)=>{return err;});
    }

}
