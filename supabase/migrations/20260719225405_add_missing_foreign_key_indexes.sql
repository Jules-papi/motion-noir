create index result_overrides_created_by_participant_idx
  on public.result_overrides(created_by_participant_id);

create index result_overrides_room_question_idx
  on public.result_overrides(room_question_id);

create index room_custom_questions_created_by_participant_idx
  on public.room_custom_questions(created_by_participant_id);

create index room_questions_custom_question_idx
  on public.room_questions(custom_question_id)
  where custom_question_id is not null;

create index room_questions_question_idx
  on public.room_questions(question_id)
  where question_id is not null;

create index rooms_test_type_idx
  on public.rooms(test_type_id);

;
