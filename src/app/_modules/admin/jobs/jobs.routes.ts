import { Routes } from "@angular/router";
import { ListComponent } from "./list/list.component";
import { AddOrEditComponent } from "./add-or-edit/add-or-edit.component";
import { ViewComponent } from "./view/view.component";


export const JobsRoutes: Routes = [
    {
        path:'',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path:'list',
        component:ListComponent
    },
    {
        path:'add',
        component:AddOrEditComponent
    },
    {
        path:'edit',
        component:AddOrEditComponent
    },
    {
        path:'view',
        component:ViewComponent
    }
]