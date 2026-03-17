create or replace function update_assignment_lowsec(
    p_assignment_id uuid,
    p_step int default null,
    p_completed boolean default null
)
returns jsonb
language plpgsql
security definer
as $$
begin
    -- Update current_step if provided
    if p_step is not null then
        update assignments
        set current_step = p_step
        where id = p_assignment_id;
    end if;

    -- Mark completed if requested
    if p_completed is true then
        update assignments
        set completed_at = now()
        where id = p_assignment_id;
    end if;

    return jsonb_build_object(
        'status', 'success',
        'assignment_id', p_assignment_id,
        'step_updated', p_step,
        'completed', p_completed
    );
end;
$$;
