export interface Programme {
  abbrv: string;
  name: string;
  years: number;
  duration?: string;
  description?: string;
}

export interface College {
  abbrv: string;
  id: string;
  name: string;
  programme?: Programme;
}

export interface User {
  id?: string;
  college: College;
  endDate: Date;
  fullName: string;
  regNo: string;
  roles: string[];
  startDate: Date;
  programme: Programme;
  profilePicUrl?: string;
}

export interface Author {
  college: College;
  id: string;
  name: string;
  roles: string[];
}

export interface Announcement {
  id?: string;
  author: Author;
  body: string;
  createdAt: Date;
  department: string;
  title: string;
  visibility: string[];
  imageUrls?: string[];
}

export interface AnnouncementFormData {
  authorId: string;
  authorName: string;
  collegeAbbrv: string;
  collegeId: string;
  collegeName: string;
  roles: string;
  body: string;
  department: string;
  title: string;
  visibility: string;
  imageUrls?: string[];
}

export interface CollegeFormData {
  abbrv: string;
  name: string;
}

export interface ProgrammeFormData {
  abbrv: string;
  name: string;
  years: number;
  duration?: string;
  description?: string;
  collegeId: string;
}

export interface UserFormData {
  collegeId: string;
  programmeId?: string;
  endDate: string;
  fullName: string;
  regNo: string;
  roles: string;
  startDate: string;
  profilePicUrl?: string;
}
