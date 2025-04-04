import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  teamMembers = [
    {
      name: 'John Smith',
      role: 'Founder & CEO',
      bio: 'John founded ToolHub4Week with a vision to make powerful document tools accessible to everyone.',
      image: 'assets/images/team/john.jpg',
    },
    {
      name: 'Emily Chen',
      role: 'Lead Developer',
      bio: 'Emily leads our development team and has over 8 years of experience in web application development.',
      image: 'assets/images/team/emily.jpg',
    },
    {
      name: 'Michael Rodriguez',
      role: 'UX/UI Designer',
      bio: 'Michael is passionate about creating intuitive and accessible user interfaces that delight our users.',
      image: 'assets/images/team/michael.jpg',
    },
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      bio: 'Sarah develops our marketing strategies and helps spread the word about our tools.',
      image: 'assets/images/team/sarah.jpg',
    },
  ];

  milestones = [
    {
      year: 2023,
      title: 'ToolHub4Week Launched',
      description:
        'We launched our platform with the initial set of PDF and image conversion tools.',
    },
    {
      year: 2024,
      title: 'Reached 10,000 Users',
      description:
        'Our user base grew rapidly as we added more features and improved our platform.',
    },
    {
      year: 2024,
      title: 'Added Document Conversion Tools',
      description:
        'We expanded our toolkit with more document conversion and manipulation options.',
    },
    {
      year: 2025,
      title: 'Mobile App Release',
      description:
        'Looking ahead, we plan to launch our mobile app to make our tools even more accessible.',
    },
  ];
}
