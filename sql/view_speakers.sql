DROP VIEW IF EXISTS speakers_view;

CREATE VIEW speakers_view AS
SELECT
    s.id,
    s.route_pathname,
    s.name,
    s.photoURL,
    -- 計算 appearances_count：僅針對目前 speaker
    COALESCE((
        SELECT COUNT(DISTINCT ss.speech_filename)
        FROM speech_speakers ss
        WHERE ss.speaker_route_pathname = s.route_pathname
    ), 0) AS appearances_count,
    -- 計算 sections_count：僅針對目前 speaker
    COALESCE((
        SELECT COUNT(DISTINCT sc.section_id)
        FROM speech_content sc
        WHERE sc.section_speaker = s.route_pathname
    ), 0) AS sections_count,
    -- longest_section 相關欄位：從 speech_content 找最長的 section_content
    longest_section.section_id AS longest_section_id,
    longest_section.section_content AS longest_section_content,
    longest_section.filename AS longest_section_filename,
    longest_section.display_name AS longest_section_displayname
FROM
    speakers s
    -- 子查詢：找每個 speaker 最長的 section
    LEFT JOIN (
        SELECT
            sc.section_speaker,
            sc.section_id,
            sc.section_content,
            sc.filename,
            si.display_name
        FROM
            speech_content sc
            LEFT JOIN speech_index si ON sc.filename = si.filename
        WHERE
            sc.section_content IS NOT NULL
            AND sc.section_content != ''
            AND sc.section_speaker IS NOT NULL
            AND sc.section_speaker != ''
            AND sc.section_id = (
                SELECT
                    sc2.section_id
                FROM
                    speech_content sc2
                WHERE
                    sc2.section_speaker = sc.section_speaker
                    AND sc2.section_speaker IS NOT NULL
                    AND sc2.section_speaker != ''
                    AND sc2.section_content IS NOT NULL
                    AND sc2.section_content != ''
                ORDER BY
                    LENGTH(sc2.section_content) DESC,
                    sc2.section_id ASC
                LIMIT 1
            )
    ) longest_section ON s.route_pathname = longest_section.section_speaker;

