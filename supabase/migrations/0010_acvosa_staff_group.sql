-- ACVOSA is a distinct group within a unit, alongside the postgraduate
-- committee, innovation champions, graduates, interns/research assistants and
-- permanent staff. (The Institute itself is IRD; ACVOSA is a body inside it.)
alter type unit_staff_category add value if not exists 'ACVOSA' after 'Postgraduate Committee';
