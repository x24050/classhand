
export default async function handler(req, res) {
    try {
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).json({ error: "studentId が未定義です" });
        }

        const parts = studentId.split("-");
        return res.status(200).json({ parts });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
