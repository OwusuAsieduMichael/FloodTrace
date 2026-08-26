-- Ghana emergency numbers provided for production use.
-- 112 is the national toll-free line for Police, Fire, Ambulance, and NADMO.

UPDATE public.app_config
SET
  value = '[
    {
      "name": "National Emergency",
      "phone": "112",
      "description": "Toll-free. Connects Police, Fire, Ambulance, and NADMO."
    },
    {
      "name": "Ghana Police Service",
      "phone": "18555",
      "description": "Police emergencies. You can also dial 112."
    },
    {
      "name": "Ghana National Fire Service",
      "phone": "192",
      "description": "Fire and rescue. You can also dial 112. Office: 0302 772 446."
    },
    {
      "name": "National Ambulance Service",
      "phone": "193",
      "description": "Medical emergencies. You can also dial 112."
    },
    {
      "name": "NADMO",
      "phone": "0302 964 884",
      "description": "National Disaster Management Organisation. Also reachable via 112."
    }
  ]'::JSONB,
  description = 'Ghana emergency contact numbers. 112 is the national toll-free line for all services.',
  updated_at = now()
WHERE key = 'emergency_contacts';
