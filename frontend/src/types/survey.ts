import React from 'react';

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  type: string;
  name: string;
  title: string;
  options?: any;
}

export interface Response {
  id: number;
  surveyId: number;
  answers: Answer[];
  submittedAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  value: any;
}

export interface Report {
  id: number;
  surveyId: number;
  title: string;
  summary: string;
  responses: Response[];
  createdAt: string;
}
