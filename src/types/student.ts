export interface StudentExamCardData {
  student: {
    id: string;
    nisn: string;
    full_name: string;
    photo_url: string | null;
    place_of_birth: string | null;
    date_of_birth: string | null;
    exam_room: string | null;
    exam_password: string | null;
    class_id: string;
    approval_status: 'Pending' | 'Approved';
  };
  classInfo: {
    id: string;
    class_name: string;
    major: string;
  };
  exam: {
    id: string;
    exam_name: string;
    academic_year: string;
    semester: string;
    server_url: string | null;
  };
  schedules: {
    id: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    subject: string;
    room: string | null;
  }[];
  examSettings: {
    id: string;
    card_title: string;
    show_photo: boolean;
    show_room: boolean;
    show_schedule: boolean;
    allow_download: boolean;
    allow_print: boolean;
    chairperson_name: string | null;
    signature_url: string | null;
    exam_notes: string | null;
  };
  schoolProfile: {
    id: string;
    school_name: string;
    npsn: string;
    address: string;
    logo_url: string | null;
  };
  examCard: {
    id: string;
    card_number: string;
    is_active: boolean;
  };
}
