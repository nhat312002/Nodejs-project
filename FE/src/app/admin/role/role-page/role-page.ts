import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Role, RoleService } from 'src/app/services/role';

@Component({
  selector: 'app-role-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-page.html',
  styleUrl: './role-page.css'
})
export class RolePage implements OnInit {
  roles: Role[] = [];
  loading = true;

  constructor(readonly roleService: RoleService) {}

  ngOnInit(): void {
    this.roleService.getAllRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy roles:', err);
        this.loading = false;
      }
    });
  }
}
