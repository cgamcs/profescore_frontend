export interface Professor {
    _id: string;
    name: string;
    department: string;
    biography: string;
    subjects: Subject[];
    ratingStats: {
        totalRatings: number;
        averageGeneral: number;
        averageExplanation: number;
        averageAccessibility: number;
        averageDifficulty: number;
        averageAttendance: number;
    };
}

export interface RatingType {
    _id: string;
    general: number;
    comment: string;
    subject: Subject;
    createdAt: string;
    likes: string[];
}

export interface Subject {
    _id: string;
    name: string;
}