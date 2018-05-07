import {Component, OnInit, ViewChild} from '@angular/core';
import {Tab} from '../models/tab';
import { Node } from '../models/node';
import {NewickParser} from '../utils/newick-parser';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {Visualizer} from '../interfaces/visualizer';
import {GeneralizedPythagorasTree} from '../visualizations/generalized-pythagoras-tree';
import {SettingsBus} from '../providers/settings-bus';
import {Settings} from '../interfaces/settings';
import {OpenglDemoTree} from "../visualizations/opengl-demo-tree";
import {SimpleTreeMap} from "../visualizations/simple-tree-map";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    public tabs: Tab[] = [];
    public tree: Node;
    public visualizers: Visualizer[];

    private activeTab: Tab;

    @ViewChild(SidebarComponent) private sidebar: SidebarComponent;

    private parser = new NewickParser();

    constructor(private settingsBus: SettingsBus) {
        this.createVisualizers();

        // TODO: remove this example of how settings are updated
        this.settingsBus.settingsChanged.subscribe((settings: Settings) => {
            console.log(settings);
        });
    }

    ngOnInit(): void {
        this.addTab(this.visualizers[0]); // TODO: remove first tab
        window.addEventListener('resize', () => this.resizeActiveTab());
    }

    /** @author Jordy Verhoeven */
    parseTree(data: string) {
        const line = this.parser.extractLines(data);

        if (line !== null) {
            this.tree = this.parser.parseTree(line);

            setTimeout(() => {
                this.sidebar.reloadData();
                this.redrawAllTabs();
            }, 100);
        }
    }
    /** @end-author Jordy Verhoeven */

    /** @author Bart Wesselink */
    public addVisualization(visualizer: Visualizer): void {
        this.addTab(visualizer);
    }

    public closeTab(tab: Tab) {
        tab.window.destroyScene();

        const wasActive = tab === this.activeTab;
        const index = this.tabs.indexOf(tab);

        this.tabs = this.tabs.filter(item => item !== tab);

        if (this.tabs.length > 0 && wasActive) {
            this.switchTab(this.tabs[Math.max(index - 1, 0)]);
        }
    }

    public switchTab(tab: Tab) {
        for (const item of this.tabs) {
            item.active = false;
        }

        tab.active = true;
        this.activeTab = tab;

        if (tab.window) {
            setTimeout(() => {
                tab.window.render();
            }, 100);

            this.resizeActiveTab();
        }
    }

    private createVisualizers(): void {
        this.visualizers = [
            new OpenglDemoTree(),
            new GeneralizedPythagorasTree(),
            new SimpleTreeMap(),
        ];
    }

    private resizeActiveTab(): void {
        setTimeout(() => {
            this.activeTab.window.setHeight();
        });
    }

    private redrawAllTabs(): void {
        for (const tab of this.tabs) {
            if (tab.window) {
                tab.window.startScene();
            }
        }
    }

    private addTab(visualizer: Visualizer) {
        this.tabs.push({
            visualizer: visualizer,
            active: false,
        });

        this.switchTab(this.tabs[this.tabs.length - 1]); // always show new visualization when tab is added
    }
    /** @end-author Bart Wesselink */
}
